import unittest

from voice_tuning import gemini_model_settings, native_activity_detection


class GeminiMigrationTests(unittest.TestCase):
    def test_model_specific_thinking_preserves_rollback_without_leaking_legacy_fields(self):
        self.assertEqual(gemini_model_settings({}), ('gemini-3.8-live', None))
        self.assertEqual(gemini_model_settings({'GEMINI_MODEL': '  '}), ('gemini-3.8-live', None))
        self.assertEqual(gemini_model_settings({'GEMINI_MODEL': 'models/gemini-3.8-live'}), ('gemini-3.8-live', None))
        self.assertEqual(gemini_model_settings({'GEMINI_MODEL': 'gemini-3.1-flash-live-preview'})[1], {'thinking_level': 'minimal'})
        self.assertEqual(gemini_model_settings({'GEMINI_MODEL': 'gemini-2.5-flash-native-audio-preview-12-2025'})[1], {'thinking_budget': 0})

    def test_unverified_model_fails_without_echoing_configuration(self):
        with self.assertRaises(ValueError) as error:
            gemini_model_settings({'GEMINI_MODEL': 'private-runtime-value'})
        self.assertNotIn('private-runtime-value', str(error.exception))


class NativeEndpointingTests(unittest.TestCase):
    def test_baseline_is_preserved_until_operator_selects_a_candidate(self):
        self.assertIsNone(native_activity_detection({}))
        self.assertIsNone(native_activity_detection({"GEMINI_SILENCE_DURATION_MS": "  "}))
        self.assertEqual(native_activity_detection({"GEMINI_SILENCE_DURATION_MS": "300"}),
                         {"disabled": False, "silence_duration_ms": 300})

    def test_invalid_tuning_fails_without_echoing_environment_values(self):
        for value in ["0", "99", "2001", "9999999", "300.5", "-100", "private-runtime-value"]:
            with self.subTest(value=value), self.assertRaises(ValueError) as error:
                native_activity_detection({"GEMINI_SILENCE_DURATION_MS": value})
            self.assertNotIn(value, str(error.exception).split(" from ")[0])
        for value in ["100", "2000"]:
            self.assertEqual(native_activity_detection({"GEMINI_SILENCE_DURATION_MS": value})["silence_duration_ms"], int(value))
