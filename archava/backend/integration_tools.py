"""SDK-level integration tests use fakes and never open a paid provider call."""

import json
import os
import time
import unittest
from unittest.mock import AsyncMock, Mock, patch
from livekit.agents.llm import ToolContext
from livekit.plugins.google.utils import create_tools_config

from agent import ArchavaHost, session_metadata
import knowledge
from config import PROJECT_ID
from instructions import make_instructions
from site_context import NAVIGATION_TOPIC, SiteContext
from marketplace import MarketplaceContext, MARKET_NAVIGATION_TOPIC, MARKET_TOPIC
from assistant import ACTION_TOPIC, RESULT_TOPIC, STATE_TOPIC


class HostToolTests(unittest.IsolatedAsyncioTestCase):
    async def test_checkout_tools_review_then_require_new_real_consent_before_sandbox_creation(self):
        from livekit.agents.llm import ChatMessage
        from checkout import CheckoutContext, RESULT_TOPIC as CHECKOUT_RESULT
        from test_checkout import KEY, receipt, sign
        room = Mock()
        host = ArchavaHost(SiteContext(), room, make_instructions(), MarketplaceContext('guest-owned'))
        host._checkout = CheckoutContext('guest-owned', KEY)
        actions = []
        async def receive(data, **kwargs):
            value = json.loads(data)
            actions.append(value)
            order = receipt() | {'status': 'preview' if value['action'] == 'prepare' else 'pending'}
            packet = {'requestId': value['requestId'], 'revision': len(actions), 'code': 'review_ready' if value['action'] == 'prepare' else 'status_received', 'receipt': sign(order)}
            self.assertTrue(host._checkout.accept(CHECKOUT_RESULT, json.dumps(packet).encode(), 'guest-owned'))
        room.local_participant.publish_data = AsyncMock(side_effect=receive)
        host._checkout_consent.observe(ChatMessage(id='checkout-request', role='user', content=['Lanjut checkout'], created_at=time.time() - 1))
        result = json.loads(await host.prepare_checkout())
        self.assertEqual(result['checkout']['status'], 'preview')
        self.assertEqual(json.loads(await host.confirm_checkout())['code'], 'confirmation_required')
        self.assertEqual(len(actions), 1)
        host._checkout_consent.observe(ChatMessage(id='checkout-review', role='assistant', content=['Total demo 465 ribu, mau buat QR sandbox?'], created_at=time.time() + 1))
        host._checkout_consent.observe(ChatMessage(id='checkout-yes', role='user', content=['Ya buat QR'], created_at=time.time() + 2))
        self.assertEqual(json.loads(await host.confirm_checkout())['checkout']['status'], 'pending')
        self.assertEqual(actions[-1]['orderId'], result['checkout']['orderId'])
        await host.sync_checkout_knowledge()
        self.assertIn('APPROVED CHECKOUT STATE:', host.chat_ctx.items[-1].text_content)

    async def test_six_feature_tools_wait_for_browser_and_check_real_confirmation(self):
        from livekit.agents.llm import ChatMessage
        room = Mock()
        host = ArchavaHost(SiteContext(), room, make_instructions(), MarketplaceContext('guest-owned'))
        browser = {'revision': 1, 'brief': {'budget': 0, 'useCase': '', 'priority': 'none', 'query': '', 'category': 'all'}, 'recommendationIds': [], 'pendingCart': None, 'cart': [], 'undoAvailable': False}
        host._assistant.accept_state(STATE_TOPIC, json.dumps(browser).encode(), 'guest-owned')
        actions = []
        async def receive(data, **kwargs):
            self.assertEqual(kwargs['topic'], ACTION_TOPIC)
            value = json.loads(data)
            actions.append(value)
            action, p = value['action'], value['payload']
            browser['revision'] += 1
            status = 'applied'
            if action == 'update_brief': browser['brief'] = p['brief']
            if action == 'recommend_products': browser['recommendationIds'] = p['productIds']
            if action == 'request_cart':
                status = 'pending_confirmation'
                browser['pendingCart'] = {'requestId': value['requestId'], 'productId': p['productId'], 'quantity': p['quantity'], 'expiresAt': int(time.time() * 1000) + 120000}
            if action == 'commit_cart':
                browser['cart'] = [{'id': browser['pendingCart']['productId'], 'quantity': browser['pendingCart']['quantity']}]
                browser['pendingCart'] = None
                browser['undoAvailable'] = True
            if action == 'undo_cart': browser['cart'], browser['undoAvailable'] = [], False
            host._assistant.accept_result(RESULT_TOPIC, json.dumps({'requestId': value['requestId'], 'status': status, 'code': 'browser_verified', 'state': browser}).encode(), 'guest-owned')
        room.local_participant.publish_data = AsyncMock(side_effect=receive)
        self.assertEqual(json.loads(await host.update_shopping_brief(budget=500000, use_case='Kerja', priority='battery', query='headphone'))['status'], 'applied')
        await host.filter_shopping_catalog(sort='price-asc')
        self.assertEqual(actions[-1]['payload']['maxPrice'], 500000)
        await host.show_shopping_recommendations(['headphones', 'ritme-lite'])
        await host.focus_shopping_product('headphones', 'batteryHours')
        self.assertEqual(actions[-1]['payload']['field'], 'batteryHours')
        host._consent.observe(ChatMessage(id='user-request', role='user', content=['Masukkan yang kedua'], created_at=time.time() - 1))
        await host.request_cart_add('ritme-lite', 1)
        before = len(actions)
        self.assertEqual(json.loads(await host.confirm_cart_add())['code'], 'confirmation_required')
        self.assertEqual(len(actions), before)
        host._consent.observe(ChatMessage(id='agent-preview', role='assistant', content=['Mau aku tambahkan satu RITME?'], created_at=time.time() + 1))
        host._consent.observe(ChatMessage(id='user-confirm', role='user', content=['Ya, tambahkan.'], created_at=time.time() + 2))
        self.assertEqual(json.loads(await host.confirm_cart_add())['status'], 'applied')
        self.assertEqual(browser['cart'], [{'id': 'ritme-lite', 'quantity': 1}])
        await host.undo_cart_add()
        self.assertEqual(browser['cart'], [])
        await host.sync_assistant_knowledge()
        length = len(host.chat_ctx.items)
        browser['revision'] += 1
        host._assistant.accept_state(STATE_TOPIC, json.dumps(browser).encode(), 'guest-owned')
        await host.sync_assistant_knowledge()
        self.assertEqual(len(host.chat_ctx.items), length, 'unchanged heartbeat must not append model context')

    async def test_page_knowledge_updates_preserve_history_and_latest_revision(self):
        market = MarketplaceContext('guest-owned')
        host = ArchavaHost(SiteContext(), Mock(), make_instructions(), market)
        market.accept_packet(MARKET_TOPIC, b'{"page":"/produk/headphones","revision":1,"productIds":["headphones"],"comparisonIds":[]}', 'guest-owned')
        first = market.describe()
        await host.sync_shopping_knowledge(first)
        self.assertIn('"anc":false', host.chat_ctx.items[-1].text_content)
        market.accept_packet(MARKET_TOPIC, b'{"page":"/produk/beats-flex-wireless-earphones","revision":2,"productIds":["beats-flex-wireless-earphones"],"comparisonIds":[]}', 'guest-owned')
        await host.sync_shopping_knowledge(market.describe())
        count = len(host.chat_ctx.items)
        await host.sync_shopping_knowledge(first)
        self.assertEqual(len(host.chat_ctx.items), count)
        self.assertIn('Baterai hingga 12 jam', host.chat_ctx.items[-1].text_content)
        self.assertEqual(host._knowledge_revision, 2)

    def test_gemini_tool_categories_are_bounded_and_enums_are_nonempty(self):
        host = ArchavaHost(SiteContext(), Mock(), make_instructions())
        configs, _ = create_tools_config(ToolContext(host.tools), use_parameters_json_schema=False)
        declarations = {tool.name: tool for config in configs for tool in config.function_declarations or []}
        categories = declarations['search_catalog'].parameters.properties['category'].enum
        self.assertIn('Elektronik', categories)
        self.assertIn('all', categories)
        self.assertNotIn('headphones', categories)
        self.assertNotIn('', categories)
        self.assertNotIn('', declarations['compare_catalog_products'].parameters.properties['priority'].enum)

    async def test_shopping_tools_use_catalog_and_only_approved_navigation(self):
        room = Mock()
        room.local_participant.publish_data = AsyncMock()
        market = MarketplaceContext('guest-owned')
        host = ArchavaHost(SiteContext(), room, make_instructions(), market)
        self.assertEqual(json.loads(await host.get_shopping_context())['status'], 'not_available')
        market.accept_packet(MARKET_TOPIC, b'{"page":"/produk/headphones","revision":1,"productIds":["headphones"],"comparisonIds":["headphones","ritme-lite"]}', 'guest-owned')
        self.assertEqual(json.loads(await host.get_shopping_context())['comparison'][1]['id'], 'ritme-lite')
        self.assertEqual(json.loads(await host.get_catalog_product('headphones'))['price'], 429000)
        self.assertTrue(json.loads(await host.compare_catalog_products(['headphones', 'ritme-lite']))['demo'])
        self.assertGreater(json.loads(await host.search_catalog('headphone', max_price=500000))['total'], 0)
        await host.show_product('https://elsewhere.test')
        await host.show_comparison(['headphones', 'smartwatch'])
        room.local_participant.publish_data.assert_not_awaited()
        await host.show_comparison(['headphones', 'ritme-lite'])
        args, kwargs = room.local_participant.publish_data.await_args
        self.assertEqual(json.loads(args[0]), {'action': 'compare', 'productIds': ['headphones', 'ritme-lite']})
        self.assertEqual(kwargs['topic'], MARKET_NAVIGATION_TOPIC)

    async def test_navigation_cannot_open_an_arbitrary_url(self):
        room = Mock()
        room.local_participant.publish_data = AsyncMock()
        host = ArchavaHost(SiteContext(), room, make_instructions())
        self.assertIn("Unknown section", await host.show_site_section("https://elsewhere.test"))
        room.local_participant.publish_data.assert_not_awaited()
        self.assertIn("Requested", await host.show_site_section("business-section"))
        args, kwargs = room.local_participant.publish_data.await_args
        self.assertEqual(json.loads(args[0]), {"section": "business-section"})
        self.assertEqual(kwargs["topic"], NAVIGATION_TOPIC)
        with patch.dict(knowledge.FACTS, {"example": {"status": "planned", "text": "An example offering."}}):
            self.assertIn("[PLANNED]", await host.get_product_facts("example"))
        self.assertIn("not available", await host.get_current_page())

    def test_worker_rejects_wrong_project_or_provider_metadata(self):
        metadata = {"product": "archava-template", "projectId": PROJECT_ID, "guestIdentity": "guest-owned", "avatarProvider": "voice", "sessionSeconds": 120, "endsAt": int(time.time()) + 120}
        with patch.dict(os.environ, {"AVATAR_PROVIDER": "voice"}):
            self.assertEqual(session_metadata(json.dumps(metadata)), metadata)
            unlimited = {**metadata, "sessionSeconds": 0, "endsAt": None}
            self.assertEqual(session_metadata(json.dumps(unlimited)), unlimited)
            missing_expiry = {key: value for key, value in unlimited.items() if key != 'endsAt'}
            with self.assertRaises(ValueError):
                session_metadata(json.dumps(missing_expiry))
            for overrides in [{"projectId": "other-project"}, {"avatarProvider": "spatius"}, {"guestIdentity": "agent-host"}, {"endsAt": 0}, {"sessionSeconds": True}, {"endsAt": None}, {"sessionSeconds": 0}, {"sessionSeconds": -1}, {"sessionSeconds": 1801}, {"sessionSeconds": False, "endsAt": None}]:
                with self.subTest(overrides=overrides):
                    with self.assertRaises(ValueError):
                        session_metadata(json.dumps({**metadata, **overrides}))
            for malformed in ("[]", "null", "not-json"):
                with self.assertRaises(ValueError):
                    session_metadata(malformed)


if __name__ == "__main__":
    unittest.main()
