"""Opt-in evaluation of the real Gemini realtime model and actual shopping tools.

Text drives the same native-audio model as the worker, without a LiveKit room
or a paid avatar. This verifies knowledge/tool behavior, not microphone ASR.
No provider calls occur unless --live is explicitly supplied.
"""

import argparse
import asyncio
import hashlib
import json
import logging
import os
from pathlib import Path
import re
import time
from unittest.mock import AsyncMock, Mock

from agent import ArchavaHost, new_session
from config import ROOT
from instructions import make_instructions
from marketplace import MARKET_TOPIC, MarketplaceContext
from site_context import SiteContext


CASES = {
    "headphone-discovery": [("Ada headphone wireless di sini? Pilihannya apa dan bedanya apa?", None)],
    "current-product": [("Headphone ini ada ANC? Baterainya berapa lama? Bisa terhubung laptop dan HP sekaligus?", "headphones")],
    "budget-battery": [("Bandingkan tiga headphone wireless. Budget maksimal Rp500.000, pilih yang baterainya paling lama dan jelaskan komprominya.", None),
                       ("Kalau yang lebih murah dari itu apa, baterainya berapa? Budget tetap sama.", None)],
    "commuter": [("Aku mau headphone buat di kereta yang ramai, perlu ANC, budget maksimal Rp600.000. Mana yang cocok?", None)],
    "beats-knowledge": [("Beats Flex Wireless Earphones baterainya berapa jam dan earbud-nya magnetik nggak?", None)],
    "unknown-laptop-variant": [("MacBook Pro 14 Inch Space Grey di katalog ini RAM dan chip-nya apa?", None)],
    "page-followup": [("Produk yang aku buka ini baterainya berapa lama?", "beats-flex-wireless-earphones"),
                      ("Sekarang produk yang aku buka ada ANC? Baterainya berapa?", "headphones")],
    "blender-knowledge": [("Blender Dapur yang 560 ribu itu kapasitas dan daya listriknya berapa? Ada penggiling bumbu?", None)],
}


def contains(text, *options):
    return any(option.casefold() in text.casefold() for option in options)


def check_turn(case, index, transcript, calls, outputs, prior_outputs=()):
    checks = {"answers_in_indonesian": contains(transcript, "aku", "kamu", "ada", "baterai", "katalog", "pilihan", "blender", "belum", "tidak")}
    checks["merchandise_uses_catalog_tools"] = any(call["name"] in {"get_catalog_product", "search_catalog", "compare_catalog_products"} for call in calls) or any(product.get('knowledge') for output in outputs for product in output.get('products', []))
    checks["no_generic_website_facts_substitution"] = not any(call["name"] == "get_product_facts" for call in calls)
    checks["no_invalid_search_filter"] = not any(output.get("status") == "invalid_filter" for output in outputs)
    fetched = {call["arguments"].get("product_id") for call in calls if call["name"] == "get_catalog_product"}
    fetched.update(product['id'] for output in outputs for product in output.get('products', []) if product.get('knowledge'))
    compares = [call["arguments"] for call in calls if call["name"] == "compare_catalog_products"]
    if case == "headphone-discovery":
        checks["known_headphone_options"] = sum(contains(transcript, brand) for brand in ("SOUNDROOM", "AUDIA", "RITME", "Studio Wireless", "Focus One", "Lite Wireless")) >= 2
        checks["comparison_grounded"] = bool(compares)
    if case == "current-product" or (case == "page-followup" and index == 1):
        checks["reads_fresh_page_context"] = any(call["name"] == "get_shopping_context" for call in calls)
        checks["fetches_headphones"] = "headphones" in fetched
        checks["battery_30_hours"] = bool(re.search(r"(?:30|tiga puluh)\s*jam", transcript, re.I))
        checks["anc_absence_reported"] = contains(transcript, "ANC") and contains(transcript, "tidak", "nggak", "belum", "tanpa", "gak")
        if case == "current-product":
            checks["multipoint_reported"] = contains(transcript, "multipoint", "sekaligus", "bersamaan", "dua perangkat")
    if case == "budget-battery" and index == 0:
        checks["budget_and_priority_passed"] = any(call.get("max_price") == 500000 and call.get("priority") == "battery" for call in compares)
        checks["eligible_battery_winner"] = any(output.get("ranking", {}).get("bestMatchId") == "headphones" for output in outputs if output.get("ranking"))
        checks["recommendation_named"] = contains(transcript, "SOUNDROOM", "Studio Wireless")
        checks["battery_30_hours"] = bool(re.search(r"(?:30|tiga puluh)\s*jam", transcript, re.I))
        clauses = re.split(r'[.!?;]|\b(?:tapi|namun|tetapi|tetap)\b', transcript, flags=re.I)
        checks['does_not_negate_supported_multipoint'] = not any(re.search(r'\b(?:tidak|belum|tanpa|nggak)\b.*\bmultipoint\b', clause, re.I) for clause in clauses)
    if case == "budget-battery" and index == 1:
        checks['merchandise_uses_catalog_tools'] = checks['merchandise_uses_catalog_tools'] or any(p.get('id') == 'ritme-lite' for output in prior_outputs for p in output.get('products', []))
        checks["remembers_cheaper_alternative"] = contains(transcript, "RITME", "Lite Wireless")
        checks["battery_24_hours"] = bool(re.search(r"(?:24|dua puluh empat)\s*jam", transcript, re.I))
    if case == "commuter":
        checks["comparison_respects_budget"] = any(call.get("max_price") == 600000 for call in compares)
        checks["anc_option_named"] = contains(transcript, "AUDIA", "Focus One") and contains(transcript, "ANC")
    if case == "beats-knowledge" or (case == "page-followup" and index == 0):
        checks["fetches_beats_outside_comparison"] = "beats-flex-wireless-earphones" in fetched
        checks["battery_12_hours"] = bool(re.search(r"(?:12|dua belas)\s*jam", transcript, re.I))
        if case == "beats-knowledge":
            checks["magnetic_earbuds"] = contains(transcript, "magnet")
    if case == "unknown-laptop-variant":
        checks["fetches_correct_laptop"] = "apple-macbook-pro-14-inch-space-grey" in fetched
        checks["unknown_variant_acknowledged"] = contains(transcript, "belum", "tidak", "nggak") and contains(transcript, "RAM", "chip")
        checks["no_invented_variant"] = not re.search(r"\bM[1-5]\b|\b(?:8|16|32|64)\s*(?:GB|gigabait)", transcript, re.I)
    if case == "blender-knowledge":
        checks["fetches_correct_blender"] = "boxed-blender" in fetched
        checks["capacity_1_5_litres"] = bool(re.search(r"(?:1[.,]5|satu (?:koma lima|setengah))\s*liter", transcript, re.I))
        checks["power_350_watts"] = bool(re.search(r"(?:350|tiga ratus lima puluh)\s*watt", transcript, re.I))
        checks["grinder_reported"] = contains(transcript, "penggiling", "grinder")
    return checks


async def run_case(name):
    prompt = make_instructions(provider=os.getenv("AVATAR_PROVIDER", "spatius"))
    session = new_session(prompt)
    room = Mock()
    room.local_participant.publish_data = AsyncMock()
    market = MarketplaceContext("guest-evaluation")
    host = ArchavaHost(SiteContext(), room, prompt, market)
    turns = []
    prior_outputs = []
    started = time.monotonic()
    try:
        await session.start(agent=host, record=False, session_host=False)
        for index, (question, current_product) in enumerate(CASES[name]):
            market.accept_packet(MARKET_TOPIC, json.dumps({"page": f"/produk/{current_product}" if current_product else "/", "revision": index + 1,
                "productIds": [current_product] if current_product else [], "comparisonIds": []}).encode(), "guest-evaluation")
            await host.sync_shopping_knowledge(market.describe())
            result = await asyncio.wait_for(session.run(user_input=question), timeout=60)
            calls, outputs, text = [], [], []
            for event in result.events:
                if event.type == "function_call":
                    calls.append({"name": event.item.name, "arguments": json.loads(event.item.arguments)})
                elif event.type == "function_call_output":
                    try:
                        output = json.loads(event.item.output)
                        if isinstance(output, dict):
                            outputs.append(output)
                    except (ValueError, TypeError):
                        pass
                elif event.type == "message" and event.item.role == "assistant":
                    text.append(event.item.text_content or "")
            transcript = " ".join(text)
            if not transcript and not calls:
                return {"case": name, "passed": False, "errorType": "EmptyModelResponse", "turns": turns}
            checks = check_turn(name, index, transcript, calls, outputs, prior_outputs)
            prior_outputs.extend(outputs)
            if current_product:
                # Full page knowledge is now supplied before the turn, so a
                # second retrieval is optional; verify facts and the new revision.
                checks.pop('merchandise_uses_catalog_tools', None)
                checks.pop('reads_fresh_page_context', None)
                checks.pop('fetches_headphones', None)
                checks.pop('fetches_beats_outside_comparison', None)
                checks['page_knowledge_revision_synced'] = host._knowledge_revision == index + 1
            turns.append({"question": question, "answer": transcript, "calls": calls, "checks": checks, "passed": all(checks.values())})
        return {"case": name, "passed": all(turn["passed"] for turn in turns), "seconds": round(time.monotonic() - started, 2), "turns": turns}
    except Exception as error:
        # Provider exception messages/tracebacks can contain transport credentials.
        return {"case": name, "passed": False, "errorType": type(error).__name__, "turns": turns}
    finally:
        await session.aclose()


async def main(args):
    # Keep credentials and raw provider diagnostics out of the report/terminal.
    logging.disable(logging.CRITICAL)
    cases = [args.case] if args.case else list(CASES)
    results = []
    for case in cases:
        result = await run_case(case)
        results.append(result)
        print(json.dumps({"case": case, "passed": result["passed"], "failedChecks": [key for turn in result["turns"] for key, passed in turn["checks"].items() if not passed],
                          "errorType": result.get("errorType"), "seconds": result.get("seconds")}), flush=True)
    report = {"model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash-native-audio-preview-12-2025"), "mode": "realtime-native-audio-with-text-input-and-fake-page-context",
              "promptSha256": hashlib.sha256(make_instructions(provider=os.getenv('AVATAR_PROVIDER', 'spatius')).encode()).hexdigest(), "catalogSha256": hashlib.sha256((ROOT / "config/catalog.json").read_bytes()).hexdigest(),
              "passed": all(result["passed"] for result in results), "results": results}
    output = Path(args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    output.chmod(0o600)
    print(f"Report: {output}", flush=True)
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="Explicitly enable billable Gemini calls using the local project environment")
    parser.add_argument("--case", choices=list(CASES))
    parser.add_argument("--output", default=str(ROOT / ".logs/shopping-evaluation.json"))
    args = parser.parse_args()
    if not args.live:
        parser.error("Use --live to explicitly enable provider calls; unit tests never run this evaluator.")
    raise SystemExit(asyncio.run(main(args)))
