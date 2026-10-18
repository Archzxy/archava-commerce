"""Per-stage voice timings. Never log messages, tool arguments, or credentials."""

import json
import logging
import time
from functools import wraps

logger = logging.getLogger("archava.latency")
RECEIPT_CODES = {"review_ready", "status_received", "stale_order", "busy", "checkout_not_applied", "confirmation_required", "unknown"}


class LatencyTrace:
    def __init__(self, *, clock=time.monotonic, emit=None):
        self.clock = clock
        self.emit = emit or (lambda value: logger.info("[latency] %s", json.dumps(value)))
        self.first_audio = None

    def mark(self, stage, started, *, outcome=None, receipt_code=None):
        record = {"stage": stage, "durationMs": round((self.clock() - started) * 1000)}
        if outcome in {"applied", "pending_confirmation", "cancelled", "rejected", "unknown", "error"}:
            record["outcome"] = outcome
        if receipt_code in RECEIPT_CODES:
            record["receiptCode"] = receipt_code
        self.emit(record)

    def audio_received(self):
        self.first_audio = self.clock()
        self.emit({"stage": "model_first_audio"})

    def playback_started(self, _event):
        if self.first_audio is not None:
            self.mark("audio_to_playback", self.first_audio)
            self.first_audio = None

    def model_metrics(self, metrics):
        # Provider TTFT starts at response creation and excludes earlier waiting.
        self.emit({"stage": "model_metrics", "providerTtftMs": round(metrics.ttft * 1000) if metrics.ttft >= 0 else None,
                   "generationMs": round(metrics.duration * 1000), "inputTokens": metrics.input_tokens,
                   "outputTokens": metrics.output_tokens})


def timed_tool(function):
    @wraps(function)
    async def call(self, *args, **kwargs):
        started = self.latency.clock()
        outcome = None
        receipt_code = None
        try:
            result = await function(self, *args, **kwargs)
            if isinstance(result, str):
                try:
                    value = json.loads(result)
                    status = value.get("status") if isinstance(value, dict) else None
                    outcome = status if isinstance(status, str) else None
                    code = value.get("code") if isinstance(value, dict) else None
                    receipt_code = code if isinstance(code, str) else None
                except ValueError:
                    pass
            return result
        except BaseException:
            outcome = "error"
            raise
        finally:
            self.latency.mark("tool:" + function.__name__, started, outcome=outcome, receipt_code=receipt_code)
    return call
