"""Exercise the real entrypoint and SDK options without calling any provider."""

import asyncio
import json
import os
import unittest
from contextlib import ExitStack
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import agent
from config import BRAND, PROJECT_ID
from instructions import make_instructions
from site_context import PAGE_TOPIC, PAGE_ACK_TOPIC
from marketplace import MARKET_TOPIC, MARKET_ACK_TOPIC


class WorkerLifecycleTests(unittest.IsolatedAsyncioTestCase):
    async def test_failed_avatar_persists_public_status_and_still_enforces_room_expiry(self):
        metadata = {"product": "archava-template", "projectId": PROJECT_ID,
                    "guestIdentity": "guest-owned", "avatarProvider": "spatius", "sessionSeconds": 120, "endsAt": 1120}
        room = SimpleNamespace(name='template-unit-room', metadata=json.dumps(metadata), on=lambda _: lambda handler: handler)
        room.local_participant = SimpleNamespace(publish_data=AsyncMock())
        room_api = SimpleNamespace(update_room_metadata=AsyncMock(), delete_room=AsyncMock())
        ctx = SimpleNamespace(room=room, connect=AsyncMock(), api=SimpleNamespace(room=room_api), add_shutdown_callback=Mock())
        session = Mock(start=AsyncMock())
        avatar = Mock(start=AsyncMock(side_effect=RuntimeError('creditsExhausted: private-key')))
        with patch.dict(os.environ, {"AVATAR_PROVIDER": "spatius", "SPATIUS_API_KEY": "test-key", "SPATIUS_APP_ID": "test-app", "SPATIUS_AVATAR_ID": "test-avatar"}), \
                patch.object(agent.time, 'time', return_value=1000), patch.object(agent.asyncio, 'sleep', new_callable=AsyncMock), \
                patch.object(agent, 'new_session', return_value=session), patch.object(agent.spatius, 'AvatarSession', return_value=avatar):
            await agent.entrypoint(ctx)
        session.start.assert_not_awaited()
        request = room_api.update_room_metadata.await_args.args[0]
        self.assertEqual(request.room, room.name)
        public = json.loads(request.metadata)
        self.assertEqual(public, metadata | {"archavaSession": {"status": "failed", "code": "avatar_credits_exhausted"}})
        self.assertNotIn('private-key', request.metadata)
        self.assertEqual(room_api.delete_room.await_args.args[0].room, room.name)

    async def test_latency_probe_passes_audio_frames_through_without_buffering(self):
        host = agent.ArchavaHost(Mock(), Mock(), make_instructions())
        frames = [object(), object()]
        consumed = []
        async def source():
            for frame in frames:
                consumed.append(frame)
                yield frame
        with patch.object(agent.Agent.default, 'realtime_audio_output_node', side_effect=lambda _, audio, __: audio):
            stream = host.realtime_audio_output_node(source(), {})
            self.assertIs(await anext(stream), frames[0])
            self.assertEqual(consumed, frames[:1])
            self.assertIs(await anext(stream), frames[1])
            with self.assertRaises(StopAsyncIteration):
                await anext(stream)

    async def run_provider(self, provider, *, expire=False):
        events, handlers, callbacks = [], {}, []
        guest = "guest-owned"
        room = SimpleNamespace(
            name="template-unit-room",
            metadata=json.dumps({
                "product": "archava-template", "projectId": PROJECT_ID,
                "guestIdentity": guest, "avatarProvider": provider,
                "sessionSeconds": 120, "endsAt": 1120,
            }),
            local_participant=SimpleNamespace(publish_data=AsyncMock()),
        )

        def on(event):
            def register(handler):
                handlers[event] = handler
                return handler
            return register

        room.on = on

        async def record_connect():
            events.append("connect")

        async def record_avatar_start(*args, **kwargs):
            events.append("avatar-start")

        async def record_join(*args, **kwargs):
            events.append("avatar-join")

        async def record_session_start(*args, **kwargs):
            events.append("session-start")

        session = Mock()
        session.start = AsyncMock(side_effect=record_session_start)
        session.generate_reply = Mock(side_effect=lambda **kwargs: events.append("greeting"))
        avatar = Mock(start=AsyncMock(side_effect=record_avatar_start), wait_for_join=AsyncMock(side_effect=record_join))
        ctx = SimpleNamespace(
            room=room, connect=AsyncMock(side_effect=record_connect),
            api=SimpleNamespace(room=SimpleNamespace(delete_room=AsyncMock())),
            add_shutdown_callback=callbacks.append,
        )
        real_sleep = asyncio.sleep
        env = {
            "AVATAR_PROVIDER": provider, "SPATIUS_API_KEY": "test-key",
            "SPATIUS_APP_ID": "test-app", "SPATIUS_AVATAR_ID": "test-avatar",
            "TAVUS_API_KEY": "test-key", "FACE_ID": "test-face",
        }
        with ExitStack() as stack:
            stack.enter_context(patch.dict(os.environ, env))
            stack.enter_context(patch.object(agent.time, "time", return_value=1000))
            factory = stack.enter_context(patch.object(agent, "new_session", return_value=session))
            spatius = stack.enter_context(patch.object(agent.spatius, "AvatarSession", return_value=avatar))
            tavus = stack.enter_context(patch.object(agent.tavus, "AvatarSession", return_value=avatar))
            sleep = stack.enter_context(patch.object(agent.asyncio, "sleep", new_callable=AsyncMock)) if expire else None
            try:
                await agent.entrypoint(ctx)
                expected = ["connect", "session-start", "greeting"] if provider == "voice" else ["connect", "avatar-start", "avatar-join", "session-start", "greeting"]
                self.assertEqual(events, expected)
                self.assertIn(BRAND["name"], factory.call_args.args[0])
                self.assertEqual(spatius.call_count, int(provider == "spatius"))
                self.assertEqual(tavus.call_count, int(provider == "tavus"))
                options = session.start.await_args.kwargs["room_options"]
                self.assertTrue(options.close_on_disconnect)
                if provider == "spatius":
                    self.assertFalse(options.audio_output)
                else:
                    self.assertIs(options.audio_output, agent.NOT_GIVEN)

                handler = handlers["data_received"]
                data = b'{"section":"top","revision":1}'
                handler(SimpleNamespace(topic=PAGE_TOPIC, data=data, participant=SimpleNamespace(identity="guest-foreign")))
                room.local_participant.publish_data.assert_not_awaited()
                handler(SimpleNamespace(topic=PAGE_TOPIC, data=data, participant=SimpleNamespace(identity=guest)))
                await real_sleep(0)
                room.local_participant.publish_data.assert_awaited_once_with(
                    b'{"section": "top", "revision": 1}', reliable=True, topic=PAGE_ACK_TOPIC,
                )
                room.local_participant.publish_data.reset_mock()
                for revision, page in [(2, '/produk/headphones'), (3, '/bandingkan')]:
                    payload = json.dumps({'page': page, 'revision': revision, 'productIds': ['headphones'], 'comparisonIds': ['headphones', 'ritme-lite']}).encode()
                    handler(SimpleNamespace(topic=MARKET_TOPIC, data=payload, participant=SimpleNamespace(identity=guest)))
                await real_sleep(0)
                acknowledgements = room.local_participant.publish_data.await_args_list
                self.assertEqual([json.loads(item.args[0]) for item in acknowledgements], [{'page': '/produk/headphones', 'revision': 2}, {'page': '/bandingkan', 'revision': 3}])
                self.assertTrue(all(item.kwargs['topic'] == MARKET_ACK_TOPIC for item in acknowledgements))
                if expire:
                    sleep.assert_awaited_once_with(120)
                    ctx.api.room.delete_room.assert_awaited_once()
                    self.assertEqual(ctx.api.room.delete_room.await_args.args[0].room, room.name)
            finally:
                for callback in callbacks:
                    await callback()

    async def test_voice_starts_without_an_avatar_and_acknowledges_only_its_guest(self):
        await self.run_provider("voice")

    async def test_spatius_attaches_before_voice_and_disables_duplicate_audio(self):
        await self.run_provider("spatius")

    async def test_tavus_starts_before_voice(self):
        await self.run_provider("tavus")

    async def test_worker_deadline_deletes_its_room_without_the_node_api(self):
        await self.run_provider("voice", expire=True)

    def test_sdk_receives_the_original_realtime_tuning(self):
        with patch.dict(os.environ, {
            "GEMINI_API_KEY": "unit-test-only", "GEMINI_VOICE": "Kore",
            "GEMINI_MODEL": "gemini-2.5-flash-native-audio-preview-12-2025",
        }):
            session = agent.new_session(make_instructions())
        self.assertEqual(session.llm._opts.model, "gemini-2.5-flash-native-audio-preview-12-2025")
        self.assertEqual(session.llm._opts.voice, "Kore")
        self.assertEqual(session.llm._opts.thinking_config.thinking_budget, 0)
        self.assertEqual(session._opts.endpointing_overrides, {"min_delay": 0.15, "max_delay": 0.6})
        interruption = session._opts.turn_handling["interruption"]
        self.assertTrue(interruption["enabled"])
        self.assertEqual(interruption["min_duration"], 0.8)
        self.assertEqual(interruption["min_words"], 1)


if __name__ == "__main__":
    unittest.main()
