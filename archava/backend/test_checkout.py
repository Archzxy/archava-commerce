import asyncio
import base64
import hashlib
import hmac
import json
import subprocess
import time
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock

from assistant import CartConsent
from checkout import CheckoutContext, RESULT_TOPIC, STATE_TOPIC, verify_receipt
from config import PROJECT_ID

KEY = hmac.new(b'offline-test-secret', b'archava-checkout-v1', hashlib.sha256).digest()


def sign(value):
    payload = base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip('=')
    signature = base64.urlsafe_b64encode(hmac.new(KEY, payload.encode(), hashlib.sha256).digest()).decode().rstrip('=')
    return payload + '.' + signature


def receipt():
    now = int(time.time() * 1000)
    return {'v': 1, 'purpose': 'receipt', 'projectId': PROJECT_ID, 'orderId': 'DOPA-SBX-0d8178e1-c6c7-4ab4-81a6-893be9d924ab',
            'items': [{'id': 'headphones', 'quantity': 1, 'price': 450000}], 'shipping': 'standard', 'subtotal': 450000,
            'shippingCost': 15000, 'amount': 465000, 'createdAt': now, 'expiresAt': now + 900000,
            'observedAt': now, 'status': 'pending', 'configured': True}


class CheckoutReceiptTests(unittest.TestCase):
    def test_v2_email_status_is_signed_bounded_and_contains_no_recipient(self):
        value = receipt() | {'v': 2, 'emailStatus': 'waiting_payment'}
        self.assertEqual(verify_receipt(sign(value), KEY), value)
        paid = value | {'status': 'paid', 'emailStatus': 'accepted'}
        self.assertEqual(verify_receipt(sign(paid), KEY), paid)
        for bad in [value | {'emailStatus': 'accepted'}, paid | {'emailStatus': 'delivered'},
                    paid | {'email': 'private@example.test'}, value | {'v': 1}, paid | {'v': True}]:
            self.assertIsNone(verify_receipt(sign(bad), KEY))
        context = CheckoutContext('guest-owned', KEY)
        self.assertTrue(context.accept(STATE_TOPIC, json.dumps({'revision': 1, 'receipt': sign(paid)}).encode(), 'guest-owned'))
        self.assertIn('accepted', context.describe())
        self.assertNotIn('@', context.describe())

    def test_real_node_signature_is_verified_by_python_without_token_in_model_context(self):
        # Cross-language signing test uses a public, synthetic test secret only.
        source = """import {checkoutSigningKey,createCheckout} from './server/checkout.mjs';
import {project} from './server/config.mjs';
const checkout=createCheckout({projectId:project.projectId,signingKey:checkoutSigningKey({CHECKOUT_SIGNING_KEY:'offline-test-secret'})});
process.stdout.write(checkout.draft({items:[{id:'headphones',quantity:1}],shipping:'standard'}).receipt);"""
        token = subprocess.check_output(['node', '--input-type=module', '-e', source], cwd=Path(__file__).resolve().parent.parent).decode()
        verified = verify_receipt(token, KEY)
        self.assertEqual(verified['status'], 'unavailable')
        context = CheckoutContext('guest-owned', KEY)
        self.assertTrue(context.accept(STATE_TOPIC, json.dumps({'revision': 1, 'receipt': token}).encode(), 'guest-owned'))
        self.assertNotIn(token, context.describe())

    def test_receipts_reject_tampering_wrong_project_purpose_stale_and_false_paid(self):
        value = receipt()
        self.assertEqual(verify_receipt(sign(value), KEY), value)
        for changes in [{'projectId': 'foreign-project'}, {'purpose': 'draft'}, {'observedAt': value['observedAt'] - 31000}, {'configured': False, 'status': 'paid'}, {'amount': 1}, {'items': [{'recipient': 'private'}]}]:
            self.assertIsNone(verify_receipt(sign(value | changes), KEY))
        token = sign(value)
        self.assertIsNone(verify_receipt(token + 'x', KEY))
        payload = base64.urlsafe_b64encode(json.dumps(value | {'status': 'paid'}).encode()).decode().rstrip('=')
        self.assertIsNone(verify_receipt(payload + '.' + token.split('.')[1], KEY))

    def test_exact_guest_revision_and_paid_transition_are_bound_and_deduplicated(self):
        context = CheckoutContext('guest-owned', KEY)
        value = receipt()
        def packet(revision, changes=None):
            return json.dumps({'revision': revision, 'receipt': sign(value | (changes or {}))}).encode()
        self.assertFalse(context.accept(STATE_TOPIC, packet(1), 'guest-other'))
        self.assertTrue(context.accept(STATE_TOPIC, packet(1), 'guest-owned'))
        self.assertFalse(context.accept(STATE_TOPIC, packet(1), 'guest-owned'))
        self.assertTrue(context.accept(STATE_TOPIC, packet(2, {'status': 'paid'}), 'guest-owned'))
        self.assertTrue(context.paid_notice)
        context.paid_notice = False
        self.assertTrue(context.accept(STATE_TOPIC, packet(3, {'status': 'paid'}), 'guest-owned'))
        self.assertFalse(context.paid_notice)
        fresh = CheckoutContext('guest-owned', KEY)
        self.assertTrue(fresh.accept(STATE_TOPIC, packet(1, {'status': 'paid'}), 'guest-owned'))
        self.assertFalse(fresh.paid_notice, 'old paid state on reconnect is not a new payment event')

    def test_checkout_consent_needs_new_affirmative_after_spoken_review(self):
        consent = CartConsent({'ya buat qr', 'setuju'})
        def message(role, text, offset, mid):
            return SimpleNamespace(role=role, text_content=text, created_at=time.time() + offset, id=mid)
        consent.observe(message('user', 'Lanjut checkout', -1, 'request'))
        consent.propose('order-preview')
        self.assertFalse(consent.allowed('order-preview'))
        consent.observe(message('assistant', 'Total demo 465 ribu, mau buat QR sandbox?', 1, 'review'))
        consent.observe(message('user', 'Jangan buat QR', 2, 'no'))
        self.assertFalse(consent.allowed('order-preview'))
        consent.observe(message('user', 'Ya, buat QR.', 3, 'yes'))
        self.assertTrue(consent.allowed('order-preview'))
        self.assertFalse(consent.allowed('another-order'))


class CheckoutActionTests(unittest.IsolatedAsyncioTestCase):
    async def test_tool_receipt_requires_matching_guest_request_and_valid_signature(self):
        context = CheckoutContext('guest-owned', KEY)
        async def receive(data, **kwargs):
            action = json.loads(data)
            result = {'requestId': action['requestId'], 'revision': 1, 'code': 'review_ready', 'receipt': sign(receipt() | {'status': 'preview'})}
            encoded = json.dumps(result).encode()
            self.assertFalse(context.accept(RESULT_TOPIC, encoded, 'guest-other'))
            self.assertFalse(context.accept(RESULT_TOPIC, json.dumps(result | {'requestId': 'unsolicited'}).encode(), 'guest-owned'))
            self.assertTrue(context.accept(RESULT_TOPIC, encoded, 'guest-owned'))
        room = SimpleNamespace(local_participant=SimpleNamespace(publish_data=AsyncMock(side_effect=receive)))
        result = json.loads(await context.request(room, 'prepare'))
        self.assertEqual(result['code'], 'review_ready')
        self.assertEqual(result['checkout']['status'], 'preview')
        self.assertNotIn('receipt', result)
        self.assertEqual(context.pending, {})

    async def test_missing_receipt_is_unknown_and_dispose_cancels_pending_work(self):
        context = CheckoutContext('guest-owned', KEY)
        room = SimpleNamespace(local_participant=SimpleNamespace(publish_data=AsyncMock()))
        result = json.loads(await context.request(room, 'status', timeout=.001))
        self.assertEqual(result['code'], 'unknown')
        task = asyncio.create_task(context.request(room, 'status'))
        await asyncio.sleep(0)
        context.close()
        with self.assertRaises(asyncio.CancelledError):
            await task
