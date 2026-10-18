"""Exercise upgraded Gemini setup and live context encoding without a connection."""

import os
import unittest
from unittest.mock import AsyncMock, Mock, patch

from google.genai import types
from livekit.agents import NOT_GIVEN
from livekit.agents.llm import ToolContext
from livekit.plugins.google.realtime.realtime_api import RealtimeSession

from agent import ArchavaHost, new_session
from instructions import make_instructions
from marketplace import MarketplaceContext
from site_context import SiteContext


class GeminiMigrationTests(unittest.IsolatedAsyncioTestCase):
    def model(self, name='', silence=''):
        with patch.dict(os.environ, {
            'GEMINI_API_KEY': 'offline-test-only', 'GEMINI_MODEL': name,
            'GEMINI_VOICE': 'Kore', 'GEMINI_SILENCE_DURATION_MS': silence,
        }):
            return new_session(make_instructions()).llm

    async def test_38_setup_omits_obsolete_options_and_waits_for_every_commerce_receipt(self):
        model = self.model(silence='300')
        self.assertEqual(model._opts.model, 'gemini-3.8-live')
        self.assertIs(model._opts.thinking_config, NOT_GIVEN)
        host = ArchavaHost(SiteContext(), Mock(), make_instructions(), MarketplaceContext('guest-test'))
        # Replace the SDK's complete network loop before constructing a session.
        with patch.object(RealtimeSession, '_main_task', new_callable=AsyncMock):
            realtime = model.session()
            try:
                await realtime.update_tools(host.tools)
                wire = realtime._build_connect_config().model_dump(by_alias=True, exclude_none=True)
                self.assertNotIn('thinkingConfig', wire.get('generationConfig', {}))
                self.assertNotIn('proactivity', wire)
                self.assertNotIn('enableAffectiveDialog', wire)
                self.assertEqual(wire['realtimeInputConfig']['automaticActivityDetection'], {'disabled': False, 'silenceDurationMs': 300})
                self.assertEqual(wire['responseModalities'], ['AUDIO'])
                self.assertEqual(wire['contextWindowCompression'], {'slidingWindow': {}})
                self.assertEqual(wire['sessionResumption'], {})
                declarations = [item for tool in wire['tools'] for item in tool.get('functionDeclarations', [])]
                self.assertEqual(len(declarations), 22)
                self.assertTrue(all(item['behavior'] == 'BLOCKING' for item in declarations))
                self.assertTrue({'confirm_cart_add', 'confirm_checkout', 'prepare_checkout', 'end_call'}.issubset({item['name'] for item in declarations}))
            finally:
                await realtime.aclose()

    async def test_31_and_38_send_append_only_background_context_without_interrupting(self):
        for name in ['gemini-3.1-flash-live-preview', 'gemini-3.8-live']:
            with self.subTest(model=name):
                model = self.model(name)
                self.assertTrue(model.capabilities.mutable_chat_context)
                self.assertTrue(model.capabilities.mutable_instructions)
                if '3.1' in name:
                    self.assertEqual(model._opts.thinking_config.thinking_level, types.ThinkingLevel.MINIMAL)
                    self.assertIsNone(model._opts.thinking_config.thinking_budget)
                with patch.object(RealtimeSession, '_main_task', new_callable=AsyncMock):
                    realtime = model.session()
                    try:
                        # Simulate an already-open provider session, never open it.
                        realtime._active_session = Mock()
                        realtime._send_client_event = Mock()
                        chat = realtime.chat_ctx.copy()
                        chat.add_message(role='assistant', content='APPROVED SHOPPING CONTEXT: revision 7, headphones')
                        await realtime.update_chat_ctx(chat)
                        event = realtime._send_client_event.call_args.args[0]
                        self.assertEqual(event.turns[0].role, 'model')
                        self.assertIn('revision 7', event.turns[0].parts[0].text)
                        self.assertFalse(event.turn_complete)
                        realtime._send_client_event.reset_mock()
                        await realtime.update_chat_ctx(chat)
                        realtime._send_client_event.assert_not_called()
                    finally:
                        realtime._active_session = None
                        await realtime.aclose()


if __name__ == '__main__':
    unittest.main()
