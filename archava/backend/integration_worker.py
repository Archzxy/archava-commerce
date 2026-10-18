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
        for seconds, ends_at, wait in [(120, 1120, 120), (0, None, 60)]:
            with self.subTest(seconds=seconds):
                await self.failed_avatar(seconds, ends_at, wait)

    async def failed_avatar(self, seconds, ends_at, wait):
        metadata = {"product": "archava-template", "projectId": PROJECT_ID,
                    "guestIdentity": "guest-owned", "avatarProvider": "spatius", "sessionSeconds": seconds, "endsAt": ends_at}
        room = SimpleNamespace(name='template-unit-room', metadata=json.dumps(metadata), on=lambda _: lambda handler: handler)
        room.local_participant = SimpleNamespace(publish_data=AsyncMock())
        room_api = SimpleNamespace(update_room_metadata=AsyncMock(), delete_room=AsyncMock())
        ctx = SimpleNamespace(room=room, connect=AsyncMock(), api=SimpleNamespace(room=room_api), add_shutdown_callback=Mock())
        session = Mock(start=AsyncMock())
        avatar = Mock(start=AsyncMock(side_effect=RuntimeError('creditsExhausted: private-key')))
        with patch.dict(os.environ, {"AVATAR_PROVIDER": "spatius", "SPATIUS_API_KEY": "test-key", "SPATIUS_APP_ID": "test-app", "SPATIUS_AVATAR_ID": "test-avatar"}), \
                patch.object(agent.time, 'time', return_value=1000), patch.object(agent.asyncio, 'sleep', new_callable=AsyncMock) as sleep, \
                patch.object(agent, 'new_session', return_value=session), patch.object(agent.spatius, 'AvatarSession', return_value=avatar):
            await agent.entrypoint(ctx)
        sleep.assert_awaited_once_with(wait)
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

    async def run_provider(self, provider, *, expire=False, delay_market_sync=False, seconds=120):
        events, handlers, callbacks = [], {}, []
        guest = "guest-owned"
        room = SimpleNamespace(
            name="template-unit-room",
            metadata=json.dumps({
                "product": "archava-template", "projectId": PROJECT_ID,
                "guestIdentity": guest, "avatarProvider": provider,
                "sessionSeconds": seconds, "endsAt": 1120 if seconds else None,
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
        release_market_sync = asyncio.Event()
        async def blocked_market_sync(snapshot):
            await release_market_sync.wait()
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
            market_sync = stack.enter_context(patch.object(agent.ArchavaHost, 'sync_shopping_knowledge', side_effect=blocked_market_sync)) if delay_market_sync else None
            try:
                await agent.entrypoint(ctx)
                expected = ["connect", "session-start", "greeting"] if provider == "voice" else ["connect", "avatar-start", "avatar-join", "session-start", "greeting"]
                self.assertEqual(events, expected)
                self.assertIn(BRAND["name"], factory.call_args.args[0])
                self.assertEqual(spatius.call_count, int(provider == "spatius"))
                self.assertEqual(tavus.call_count, int(provider == "tavus"))
                options = session.start.await_args.kwargs["room_options"]
                self.assertTrue(options.close_on_disconnect)
                self.assertTrue(options.delete_room_on_close)
                self.assertEqual(options.participant_identity, guest)
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
                    handler(SimpleNamespace(topic=MARKET_TOPIC, data=payload, participant=SimpleNamespace(identity='guest-foreign')))
                    handler(SimpleNamespace(topic=MARKET_TOPIC, data=payload, participant=SimpleNamespace(identity=guest)))
                await real_sleep(0)
                acknowledgements = room.local_participant.publish_data.await_args_list
                self.assertEqual([json.loads(item.args[0]) for item in acknowledgements], [{'page': '/produk/headphones', 'revision': 2}, {'page': '/bandingkan', 'revision': 3}])
                self.assertTrue(all(item.kwargs['topic'] == MARKET_ACK_TOPIC for item in acknowledgements))
                if market_sync:
                    self.assertFalse(release_market_sync.is_set())
                    self.assertEqual(market_sync.await_count, 2)
                    self.assertEqual([json.loads(item.args[0])['revision'] for item in market_sync.await_args_list], [2, 3])
                    release_market_sync.set()
                    await real_sleep(0)
                if expire:
                    if seconds:
                        sleep.assert_awaited_once_with(120)
                        ctx.api.room.delete_room.assert_awaited_once()
                        self.assertEqual(ctx.api.room.delete_room.await_args.args[0].room, room.name)
                    else:
                        sleep.assert_not_awaited()
                        ctx.api.room.delete_room.assert_not_awaited()
            finally:
                for callback in callbacks:
                    await callback()

    async def test_voice_starts_without_an_avatar_and_acknowledges_only_its_guest(self):
        await self.run_provider("voice")

    async def test_spatius_attaches_before_voice_and_disables_duplicate_audio(self):
        await self.run_provider("spatius")

    async def test_tavus_starts_before_voice(self):
        await self.run_provider("tavus")

    async def test_navigation_ack_does_not_wait_for_model_context_sync(self):
        await self.run_provider("voice", delay_market_sync=True)

    async def test_worker_deadline_deletes_its_room_without_the_node_api(self):
        await self.run_provider("voice", expire=True)

    async def test_completion_mode_has_no_worker_deadline(self):
        await self.run_provider("voice", expire=True, seconds=0)

    async def test_end_call_waits_for_goodbye_then_shuts_down_and_deletes_its_own_room(self):
        for realtime in (False, True):
            with self.subTest(realtime=realtime):
                await self.end_call(realtime)

    async def end_call(self, realtime):
        meta = {"product": "archava-template", "projectId": PROJECT_ID, "guestIdentity": "guest-owned",
                "avatarProvider": "voice", "sessionSeconds": 0, "endsAt": None}
        room = SimpleNamespace(name='owned-room', metadata=json.dumps(meta))
        job = SimpleNamespace(room=room, api=SimpleNamespace(room=SimpleNamespace(update_room_metadata=AsyncMock())),
                              delete_room=AsyncMock(), add_shutdown_callback=Mock(), shutdown=Mock())
        host = agent.ArchavaHost(Mock(), room, make_instructions())
        tool = next(tool for tool in host.tools if isinstance(tool, agent.EndCallTool))
        session = Mock()
        handlers = {}
        def once(event, callback=None):
            def register(handler):
                handlers[event] = handler
                return handler
            return register(callback) if callback is not None else register
        session.once.side_effect = once
        activity = SimpleNamespace(llm=Mock(spec=agent.google.realtime.RealtimeModel) if realtime else object(),
                                   realtime_llm_session=SimpleNamespace(capabilities=SimpleNamespace(auto_tool_reply_generation=True)) if realtime else None)
        session.current_agent._get_activity_or_raise.return_value = activity
        speech = Mock()
        with patch.dict(os.environ, {"AVATAR_PROVIDER": "voice"}), \
                patch.object(agent.agents, 'get_job_context', return_value=job), \
                patch('livekit.agents.beta.tools.end_call.get_job_context', return_value=job):
            output = await tool._end_call(SimpleNamespace(session=session, speech_handle=speech))
            self.assertIn('Pamit', output)
            session.shutdown.assert_not_called()
            job.delete_room.assert_not_awaited()
            request = job.api.room.update_room_metadata.await_args.args[0]
            self.assertEqual(request.room, room.name)
            self.assertEqual(json.loads(request.metadata), meta | {"archavaSession": {"status": "ending"}})
            speech.add_done_callback.call_args.args[0](speech)
            if realtime:
                # Gemini creates the spoken tool reply in a separate speech.
                await asyncio.sleep(0)
                session.shutdown.assert_not_called()
                farewell = asyncio.get_running_loop().create_future()
                handlers['speech_created'](SimpleNamespace(speech_handle=farewell))
                await asyncio.sleep(0)
                session.shutdown.assert_not_called()
                farewell.set_result(None)
                await asyncio.wait_for(tool._shutdown_session_task, timeout=1)
            session.shutdown.assert_called_once_with()
            handlers['close'](SimpleNamespace(reason=SimpleNamespace(value='user_initiated')))
            job.shutdown.assert_called_once_with(reason='user_initiated')
            await job.add_shutdown_callback.call_args.args[0]()
            job.delete_room.assert_awaited_once_with()

    def test_sdk_receives_the_original_realtime_tuning(self):
        with patch.dict(os.environ, {
            "GEMINI_API_KEY": "unit-test-only", "GEMINI_VOICE": "Kore",
            "GEMINI_MODEL": "gemini-2.5-flash-native-audio-preview-12-2025",
            "GEMINI_SILENCE_DURATION_MS": "",
        }):
            session = agent.new_session(make_instructions())
        self.assertEqual(session.llm._opts.model, "gemini-2.5-flash-native-audio-preview-12-2025")
        self.assertEqual(session.llm._opts.voice, "Kore")
        self.assertEqual(session.llm._opts.thinking_config.thinking_budget, 0)
        self.assertIs(session.llm._opts.realtime_input_config, agent.NOT_GIVEN)
        self.assertEqual(session._opts.endpointing_overrides, {"min_delay": 0.15, "max_delay": 0.6})
        interruption = session._opts.turn_handling["interruption"]
        self.assertTrue(interruption["enabled"])
        self.assertEqual(interruption["min_duration"], 0.8)
        self.assertEqual(interruption["min_words"], 1)

    def test_native_endpointing_candidate_reaches_google_sdk_without_disabling_vad(self):
        with patch.dict(os.environ, {
            "GEMINI_API_KEY": "unit-test-only", "GEMINI_SILENCE_DURATION_MS": "300",
        }):
            session = agent.new_session(make_instructions())
        wire = session.llm._opts.realtime_input_config.model_dump(by_alias=True, exclude_none=True)
        self.assertEqual(wire, {"automaticActivityDetection": {"disabled": False, "silenceDurationMs": 300}})
        self.assertTrue(session.llm.capabilities.turn_detection)


if __name__ == "__main__":
    unittest.main()
