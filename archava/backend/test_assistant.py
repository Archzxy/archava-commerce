import asyncio
import json
import time
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock
from assistant import AssistantContext, CartConsent, STATE_TOPIC, RESULT_TOPIC, ACTION_TOPIC


def state(revision=1):
    return {'revision': revision, 'brief': {'budget': 500000, 'useCase': 'Kerja', 'priority': 'battery', 'query': 'headphone', 'category': 'all'}, 'recommendationIds': ['headphones', 'ritme-lite'], 'pendingCart': None, 'cart': [], 'undoAvailable': False}


class AssistantStateTests(unittest.TestCase):
    def test_exact_guest_monotonic_revisions_and_no_private_fields(self):
        context = AssistantContext('guest-owned')
        packet = json.dumps(state()).encode()
        self.assertFalse(context.accept_state(STATE_TOPIC, packet, 'guest-foreign'))
        self.assertTrue(context.accept_state(STATE_TOPIC, packet, 'guest-owned'))
        self.assertFalse(context.accept_state(STATE_TOPIC, packet, 'guest-owned'))
        self.assertIn('"anc":false', context.describe())
        for override in [{'recipient': 'private'}, {'cart': [{'id': 'headphones', 'quantity': True}]}, {'recommendationIds': ['missing']}, {'brief': {'budget': 500000}}, {'undoAvailable': 'true'}]:
            self.assertFalse(context.accept_state(STATE_TOPIC, json.dumps(state(2) | override).encode(), 'guest-owned'))
        self.assertFalse(context.accept_state(STATE_TOPIC, b'x' * 8193, 'guest-owned'))

    def test_voice_consent_requires_fresh_user_after_proposal_and_refuses_negation(self):
        consent = CartConsent()
        def message(role, text, ident, at): return SimpleNamespace(role=role, text_content=text, id=ident, created_at=at)
        start = time.time()
        consent.observe(message('user', 'Tambahkan satu', 'user-1', start - 1))
        consent.propose('pending-one')
        self.assertFalse(consent.allowed('pending-one'))
        consent.observe(message('assistant', 'Mau aku tambahkan?', 'agent-1', start + 1))
        consent.observe(message('user', 'Ya, tambahkan.', 'user-2', start + 2))
        self.assertTrue(consent.allowed('pending-one'))
        self.assertFalse(consent.allowed('other-proposal'))
        consent.observe(message('user', 'Ya tapi jangan tambahkan', 'user-2', start + 2))
        self.assertFalse(consent.allowed('pending-one'))
        consent.observe(message('user', 'iya tapi jangan tambahkan', 'user-3', start + 3))
        self.assertFalse(consent.allowed('pending-one'))


class AssistantReceiptTests(unittest.IsolatedAsyncioTestCase):
    async def test_action_waits_for_matching_owned_browser_receipt(self):
        context = AssistantContext('guest-owned')
        context.accept_state(STATE_TOPIC, json.dumps(state()).encode(), 'guest-owned')
        room = SimpleNamespace(local_participant=SimpleNamespace(publish_data=AsyncMock()))
        task = asyncio.create_task(context.request(room, 'recommend_products', {'productIds': ['headphones']}))
        await asyncio.sleep(0)
        command = json.loads(room.local_participant.publish_data.await_args.args[0])
        self.assertEqual(room.local_participant.publish_data.await_args.kwargs['topic'], ACTION_TOPIC)
        receipt = {'requestId': command['requestId'], 'status': 'applied', 'code': 'recommendations_shown', 'state': state(2)}
        self.assertFalse(context.accept_result(RESULT_TOPIC, json.dumps(receipt).encode(), 'guest-foreign'))
        self.assertFalse(task.done())
        self.assertTrue(context.accept_result(RESULT_TOPIC, json.dumps(receipt).encode(), 'guest-owned'))
        self.assertEqual(json.loads(await task)['status'], 'applied')
        self.assertFalse(context.accept_result(RESULT_TOPIC, json.dumps(receipt).encode(), 'guest-owned'))

    async def test_missing_receipt_is_unknown_and_stale_snapshot_never_overwrites_newer_state(self):
        context = AssistantContext('guest-owned')
        room = SimpleNamespace(local_participant=SimpleNamespace(publish_data=AsyncMock()))
        result = json.loads(await context.request(room, 'undo_cart', {}, timeout=.001))
        self.assertEqual(result['status'], 'unknown')
        self.assertEqual(context.pending, {})
        context.accept_state(STATE_TOPIC, json.dumps(state(9)).encode(), 'guest-owned')
        task = asyncio.create_task(context.request(room, 'undo_cart', {}))
        await asyncio.sleep(0)
        request_id = json.loads(room.local_participant.publish_data.await_args.args[0])['requestId']
        context.accept_result(RESULT_TOPIC, json.dumps({'requestId': request_id, 'status': 'rejected', 'code': 'cart_changed', 'state': state(8)}).encode(), 'guest-owned')
        self.assertEqual(json.loads(await task)['status'], 'rejected')
        self.assertEqual(context.state['revision'], 9)


if __name__ == '__main__': unittest.main()
