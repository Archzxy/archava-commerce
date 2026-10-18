import unittest
from types import SimpleNamespace

from latency import LatencyTrace, timed_tool
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


class ToolLatencyTests(unittest.IsolatedAsyncioTestCase):
    async def test_checkout_receipt_codes_are_visible_without_payment_or_visitor_data(self):
        records = []
        host = SimpleNamespace(latency=LatencyTrace(clock=lambda: 10.0, emit=records.append))

        @timed_tool
        async def checkout_tool(self, result):
            return result

        for code in ['review_ready', 'status_received', 'unknown', 'confirmation_required']:
            await checkout_tool(host, '{"code":"' + code + '","checkout":{"orderId":"private-order","status":"paid"}}')
            self.assertEqual(records[-1], {'stage': 'tool:checkout_tool', 'durationMs': 0, 'receiptCode': code})
        for code in ['"private-user-value"', '{"unsafe":"data"}']:
            await checkout_tool(host, '{"code":' + code + '}')
            self.assertEqual(records[-1], {'stage': 'tool:checkout_tool', 'durationMs': 0})
        self.assertNotIn('private', str(records))

    async def test_receipt_status_is_logged_without_arguments_state_or_untrusted_status(self):
        records = []
        host = SimpleNamespace(latency=LatencyTrace(clock=lambda: 10.0, emit=records.append))

        @timed_tool
        async def tool(self, result):
            return result

        for status in ['applied', 'unknown', 'pending_confirmation']:
            result = '{"status":"' + status + '","shoppingState":{"query":"private visitor input"}}'
            self.assertEqual(await tool(host, result), result)
            self.assertEqual(records[-1], {"stage": "tool:tool", "durationMs": 0, "outcome": status})
        for result in ['{"status":"private visitor input"}', '{"status":{"unsafe":"data"}}', 'not JSON']:
            self.assertEqual(await tool(host, result), result)
            self.assertEqual(records[-1], {"stage": "tool:tool", "durationMs": 0})
        self.assertNotIn('private visitor input', str(records))

    async def test_failure_is_measured_and_still_propagates(self):
        records = []
        host = SimpleNamespace(latency=LatencyTrace(clock=lambda: 10.0, emit=records.append))

        @timed_tool
        async def fails(self):
            raise RuntimeError('private provider diagnostic')

        with self.assertRaises(RuntimeError):
            await fails(host)
        self.assertEqual(records, [{"stage": "tool:fails", "durationMs": 0, "outcome": "error"}])


if __name__ == '__main__':
    unittest.main()
