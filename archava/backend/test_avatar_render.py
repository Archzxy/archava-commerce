import json
import unittest
from avatar_render import AvatarRenderDiagnostics, TOPIC


class AvatarRenderTests(unittest.TestCase):
    def setUp(self):
        self.receiver = AvatarRenderDiagnostics('guest-bound')
        self.status = dict(status='timeout', stage='load_character', width=0, height=0)

    def accept(self, value, identity='guest-bound', topic=TOPIC):
        return self.receiver.accept(topic, json.dumps(value).encode(), identity)

    def test_exact_guest_and_bounded_public_fields(self):
        self.assertIsNone(self.accept(self.status, identity='guest-other'))
        self.assertIsNone(self.accept(self.status, topic='other'))
        self.assertEqual(self.accept(self.status), self.status)

    def test_rejects_messages_tokens_and_invalid_types(self):
        for update in ({'message': 'private error'}, {'stage': 'private error'}, {'status': []},
                       {'width': True}, {'height': 4097}, {'width': -1}):
            with self.subTest(update=update):
                self.assertIsNone(self.accept({**self.status, **update}))
        for raw in (b'{', b'\xff', b'x' * 257):
            self.assertIsNone(self.receiver.accept(TOPIC, raw, 'guest-bound'))

    def test_limits_log_volume_per_room(self):
        for _ in range(16):
            self.assertEqual(self.accept(self.status), self.status)
        self.assertIsNone(self.accept(self.status))
