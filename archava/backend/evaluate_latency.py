"""Opt-in native-audio latency probe using the production prompt and tools.

Measures submitted TEXT to the first model audio frame. No avatar, microphone,
or physical playback is involved. The first turn may include model connection.
"""

import argparse
import asyncio
import hashlib
import json
import logging
import os
from pathlib import Path
import time
from unittest.mock import AsyncMock, Mock

from livekit.agents.voice import io
from agent import ArchavaHost, new_session
from config import ROOT
from instructions import make_instructions
from marketplace import MARKET_TOPIC, MarketplaceContext
from site_context import SiteContext


class ProbeOutput(io.AudioOutput):
    def __init__(self):
        super().__init__(label="LatencyProbe", capabilities=io.AudioOutputCapabilities(pause=False))
        self.first_audio = None
        self.duration = 0

    async def capture_frame(self, frame):
        await super().capture_frame(frame)
        if self.first_audio is None:
            self.first_audio = time.monotonic()
            self.on_playback_started(created_at=time.time())
        self.duration += frame.samples_per_channel / frame.sample_rate

    def flush(self):
        super().flush()
        self.on_playback_finished(playback_position=self.duration, interrupted=False)

    def clear_buffer(self):
        self.on_playback_finished(playback_position=self.duration, interrupted=True)


CASES = [
    ("discovery", "Aku mau cari jam, ada pilihan apa?", None),
    ("current-product", "Headphone ini baterainya berapa lama dan ada ANC?", "headphones"),
    ("comparison", "Bandingkan tiga headphone wireless, budget maksimal Rp500.000, pilih yang baterainya paling lama dan jelaskan komprominya.", None),
]


async def measure():
    prompt = make_instructions(provider=os.getenv("AVATAR_PROVIDER", "spatius"))
    session = new_session(prompt)
    room = Mock()
    room.local_participant.publish_data = AsyncMock()
    market = MarketplaceContext("guest-latency-evaluation")
    host = ArchavaHost(SiteContext(), room, prompt, market)
    records = []
    host.latency.emit = records.append
    sink = ProbeOutput()
    session.output.audio = sink
    results = []
    try:
        await session.start(agent=host, record=False, session_host=False)
        for revision, (name, question, product) in enumerate(CASES, 1):
            market.accept_packet(MARKET_TOPIC, json.dumps({"page": f"/produk/{product}" if product else "/", "revision": revision,
                "productIds": [product] if product else [], "comparisonIds": []}).encode(), "guest-latency-evaluation")
            await host.sync_shopping_knowledge(market.describe())
            records.clear()
            sink.first_audio, sink.duration = None, 0
            started = time.monotonic()
            result = await asyncio.wait_for(session.run(user_input=question), timeout=60)
            row = {"case": name, "firstTurnMayIncludeConnection": revision == 1,
                   "textToFirstModelAudioMs": round((sink.first_audio - started) * 1000) if sink.first_audio is not None else None,
                   "turnCompleteMs": round((time.monotonic() - started) * 1000), "generatedAudioMs": round(sink.duration * 1000),
                   "providerMetrics": [r for r in records if r["stage"] == "model_metrics"],
                   "toolTimings": [r for r in records if r["stage"].startswith("tool:")],
                   "toolCalls": [e.item.name for e in result.events if e.type == "function_call"]}
            results.append(row)
            print(json.dumps(row), flush=True)
    except Exception as error:
        results.append({"errorType": type(error).__name__})
    finally:
        await session.aclose()
    return {"model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash-native-audio-preview-12-2025"),
            "thinkingBudget": 0, "mode": "text-to-native-audio-with-production-tools-no-avatar",
            "promptChars": len(prompt), "promptSha256": hashlib.sha256(prompt.encode()).hexdigest(), "results": results}


async def main(args):
    logging.disable(logging.CRITICAL)  # Raw transport failures can include credentials.
    report = await measure()
    output = Path(args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    output.chmod(0o600)
    print(f"Report: {output}", flush=True)
    return 0 if all(row.get("textToFirstModelAudioMs") is not None for row in report["results"]) else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Explicitly allow billable Gemini calls")
    parser.add_argument("--output", default=str(ROOT / ".logs/latency-evaluation.json"))
    args = parser.parse_args()
    if not args.live:
        parser.error("Use --live to explicitly enable provider calls.")
    raise SystemExit(asyncio.run(main(args)))
