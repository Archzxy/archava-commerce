import unittest
from types import SimpleNamespace

from latency import LatencyTrace
from session_status import avatar_failure_code


class LatencyTests(unittest.TestCase):
    def test_playback_delay_is_separate_from_provider_generation_and_unknown_is_not_zero(self):
        now, records = [10.0], []
        trace = LatencyTrace(clock=lambda: now[0], emit=records.append)
        trace.playback_started(None)
        self.assertEqual(records, [])
        trace.audio_received()
        now[0] += 1.25
        trace.playback_started(None)
        self.assertEqual(records[-1], {"stage": "audio_to_playback", "durationMs": 1250})
        trace.playback_started(None)
        self.assertEqual(len(records), 2)
        trace.model_metrics(SimpleNamespace(ttft=-1, duration=4, input_tokens=50, output_tokens=100))
        self.assertIsNone(records[-1]["providerTtftMs"])
        self.assertNotIn("endOfSpeechMs", records[-1])

    def test_wrapped_provider_failure_classifies_without_returning_private_error(self):
        inner = RuntimeError('creditsExhausted: insufficient credits; private-key')
        outer = RuntimeError('generic SDK startup error')
        outer.__cause__ = inner
        self.assertEqual(avatar_failure_code(outer), 'avatar_credits_exhausted')
        outer.__cause__ = RuntimeError('private-url?key=private-key')
        self.assertEqual(avatar_failure_code(outer), 'avatar_unavailable')
        outer.__cause__ = outer
        self.assertEqual(avatar_failure_code(outer), 'avatar_unavailable')


if __name__ == '__main__':
    unittest.main()
