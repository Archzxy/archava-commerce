"""Guest-bound checkout commands; only server-signed sandbox receipts are facts."""
import asyncio
import base64
import hashlib
import hmac
import json
import os
import re
import time
import uuid

from config import PROJECT_ID
from marketplace import PRODUCTS, encoded

ACTION_TOPIC = 'archava.checkout.action'
RESULT_TOPIC = 'archava.checkout.result'
STATE_TOPIC = 'archava.checkout.state'
STATUSES = {'preview', 'unavailable', 'pending', 'paid', 'expired', 'failed', 'unknown'}
EMAIL_STATUSES = {'unavailable', 'not_requested', 'waiting_payment', 'queued', 'sending', 'accepted', 'failed', 'unknown'}
RECEIPT_KEYS = {'v', 'purpose', 'projectId', 'orderId', 'items', 'shipping', 'subtotal', 'shippingCost', 'amount', 'createdAt', 'expiresAt', 'status', 'configured', 'observedAt'}
CODES = {'review_ready', 'status_received', 'stale_order', 'busy', 'checkout_not_applied'}


def signing_key():
    secret = os.getenv('CHECKOUT_SIGNING_KEY') or os.getenv('LIVEKIT_API_SECRET')
    return hmac.new(secret.encode(), b'archava-checkout-v1', hashlib.sha256).digest() if secret else None


def verify_receipt(token, key, now=None, project_id=PROJECT_ID):
    now = time.time() * 1000 if now is None else now
    try:
        if not key or not isinstance(token, str) or len(token) > 3500 or not re.fullmatch(r'[\w-]+\.[\w-]+', token):
            return None
        payload, signature = token.split('.')
        actual = base64.urlsafe_b64decode(signature + '=' * (-len(signature) % 4))
        expected = hmac.new(key, payload.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(actual, expected):
            return None
        value = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)))
        if not isinstance(value, dict):
            return None
        version = value.get('v')
        if type(version) is not int or version not in {1, 2} or set(value) != (RECEIPT_KEYS | {'emailStatus'} if version == 2 else RECEIPT_KEYS):
            return None
        if (value['purpose'] != 'receipt'
                or value['projectId'] != project_id or not re.fullmatch(r'DOPA-SBX-[a-f0-9-]{36}', value['orderId'])
                or value['status'] not in STATUSES or not isinstance(value['configured'], bool)
                or value['shipping'] not in {'standard', 'express'}):
            return None
        if any(type(value[k]) is not int or value[k] < 0 for k in ['subtotal', 'shippingCost', 'amount', 'createdAt', 'expiresAt', 'observedAt']):
            return None
        if not now - 30000 <= value['observedAt'] <= now + 5000 or value['createdAt'] > now + 5000 or value['expiresAt'] != value['createdAt'] + 900000:
            return None
        items = value['items']
        if not isinstance(items, list) or not 1 <= len(items) <= 12:
            return None
        ids = set()
        for item in items:
            if (not isinstance(item, dict) or set(item) != {'id', 'quantity', 'price'} or item['id'] not in PRODUCTS
                    or item['id'] in ids or type(item['quantity']) is not int or not 1 <= item['quantity'] <= 10
                    or type(item['price']) is not int or item['price'] < 0):
                return None
            ids.add(item['id'])
        if sum(item['quantity'] * item['price'] for item in items) != value['subtotal'] or value['subtotal'] + value['shippingCost'] != value['amount']:
            return None
        if value['status'] in {'paid', 'pending'} and not value['configured']:
            return None
        if version == 2 and (value['emailStatus'] not in EMAIL_STATUSES
                            or value['emailStatus'] in {'queued', 'sending', 'accepted'} and value['status'] != 'paid'):
            return None
        return value
    except (ValueError, TypeError, KeyError):
        return None


class CheckoutContext:
    def __init__(self, guest_identity, key=None):
        self.guest_identity = guest_identity
        self.key = signing_key() if key is None else key
        self.state = None
        self.revision = -1
        self.pending = {}
        self._lock = asyncio.Lock()
        self.paid_notice = False
        self._announced = set()

    def accept(self, topic, data, identity):
        if topic not in {STATE_TOPIC, RESULT_TOPIC} or identity != self.guest_identity or len(data) > 4096:
            return False
        try:
            packet = json.loads(data)
            keys = {'revision', 'receipt'} if topic == STATE_TOPIC else {'requestId', 'revision', 'receipt', 'code'}
            if not isinstance(packet, dict) or set(packet) != keys or type(packet['revision']) is not int or not 0 <= packet['revision'] <= 9007199254740991:
                return False
            if topic == RESULT_TOPIC and (not isinstance(packet['requestId'], str) or packet['requestId'] not in self.pending or packet['code'] not in CODES):
                return False
            receipt = verify_receipt(packet['receipt'], self.key) if packet['receipt'] is not None else None
            if packet['receipt'] is not None and receipt is None:
                return False
            if packet['revision'] <= self.revision:
                return False
            previous = self.state
            self.revision, self.state = packet['revision'], receipt
            if (previous and receipt and previous['orderId'] == receipt['orderId'] and previous['status'] in {'pending', 'unknown'}
                    and receipt['status'] == 'paid' and receipt['orderId'] not in self._announced):
                self._announced.add(receipt['orderId'])
                self.paid_notice = not bool(self.pending)
            if topic == RESULT_TOPIC:
                future = self.pending[packet['requestId']]
                if not future.done():
                    future.set_result({'code': packet['code'], 'checkout': receipt})
            return True
        except (ValueError, TypeError, KeyError):
            return False

    def describe(self):
        if not self.state or time.time() * 1000 - self.state['observedAt'] > 30000:
            return encoded({'status': 'not_verified', 'message': 'Use get_checkout_status or prepare_checkout for a fresh server receipt. Do not infer payment.'})
        return encoded({'status': 'verified_sandbox_receipt', 'checkout': self.state,
                        'notice': 'Demo only. Use the official Midtrans simulator, never a real banking/wallet app. No real order or fulfillment.'})

    async def request(self, room, action, shipping='standard', order_id='', timeout=20):
        async with self._lock:
            request_id = str(uuid.uuid4())
            future = asyncio.get_running_loop().create_future()
            self.pending[request_id] = future
            try:
                await room.local_participant.publish_data(encoded({'requestId': request_id, 'action': action, 'shipping': shipping, 'orderId': order_id}).encode(), reliable=True, topic=ACTION_TOPIC)
                return encoded(await asyncio.wait_for(future, timeout))
            except Exception:
                return encoded({'code': 'unknown', 'message': 'No verified checkout result. Check status of the same draft before retrying. Do not claim payment or a displayed QR.'})
            finally:
                self.pending.pop(request_id, None)

    def close(self):
        for future in self.pending.values():
            future.cancel()
        self.pending.clear()
