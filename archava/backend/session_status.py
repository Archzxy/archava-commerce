"""Public startup failures from server-owned room metadata, without raw errors."""


def avatar_failure_code(error):
    seen = set()
    while error is not None and id(error) not in seen:
        seen.add(id(error))
        message = str(error).casefold()
        if "creditsexhausted" in message or "insufficient credits" in message:
            return "avatar_credits_exhausted"
        error = error.__cause__ or error.__context__
    return "avatar_unavailable"
