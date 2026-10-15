"""Bounded renderer diagnostics from this room's exact guest; never raw SDK errors."""
import json

TOPIC = 'archava.avatar.render'
STAGES = {'unknown', 'avatar_core', 'compatibility_check', 'load_character',
          'load_idle_animation', 'render_system', 'first_frame', 'idle_loop'}
STATUSES = {'initializing', 'rendered', 'timeout', 'empty_surface'}


class AvatarRenderDiagnostics:
    def __init__(self, guest_identity):
        self.guest_identity = guest_identity
        self.count = 0

    def accept(self, topic, data, identity):
        if (topic != TOPIC or identity != self.guest_identity or self.count >= 16
                or not isinstance(data, bytes) or len(data) > 256):
            return None
        try:
            value = json.loads(data)
        except (ValueError, UnicodeError):
            return None
        if (not isinstance(value, dict) or set(value) != {'status', 'stage', 'width', 'height'}
                or not isinstance(value['status'], str) or value['status'] not in STATUSES
                or not isinstance(value['stage'], str) or value['stage'] not in STAGES
                or any(type(value[key]) is not int or not 0 <= value[key] <= 4096 for key in ('width', 'height'))):
            return None
        self.count += 1
        return value
