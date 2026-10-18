"""Operator-owned native Gemini endpointing; no provider calls or credentials."""

import re
from collections.abc import Mapping

DEFAULT_GEMINI_MODEL = "gemini-3.8-live"


def gemini_model_settings(env: Mapping[str, str]) -> tuple[str, dict | None]:
    """Model-specific setup; never send obsolete thinking fields to a new model."""
    model = env.get("GEMINI_MODEL", "").strip().removeprefix("models/") or DEFAULT_GEMINI_MODEL
    if model == "gemini-3.8-live":
        return model, None
    if model == "gemini-3.1-flash-live-preview":
        return model, {"thinking_level": "minimal"}
    if model == "gemini-2.5-flash-native-audio-preview-12-2025":
        return model, {"thinking_budget": 0}
    # A typo must not silently select a different provider/model or echo secrets.
    raise ValueError("GEMINI_MODEL must select a supported Gemini Live model; see the upgrade guide")


def native_activity_detection(env: Mapping[str, str]) -> dict | None:
    # An empty setting preserves the provider baseline for a real A/B comparison.
    value = env.get("GEMINI_SILENCE_DURATION_MS", "").strip()
    if not value:
        return None
    if not re.fullmatch(r"[0-9]{3,4}", value) or not 100 <= int(value) <= 2000:
        # Never echo raw environment input into logs.
        raise ValueError("GEMINI_SILENCE_DURATION_MS must be an integer from 100 to 2000")
    return {"disabled": False, "silence_duration_ms": int(value)}
