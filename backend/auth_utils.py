from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

JWT_ALG = "HS256"
TOKEN_TTL = timedelta(days=7)


def hash_password(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt())


def verify_password(plain: str, hashed: bytes) -> bool:
    if not plain or not hashed:
        return False
    return bcrypt.checkpw(plain.encode("utf-8"), hashed)


def create_access_token(user_id: int, secret: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + TOKEN_TTL,
    }
    return jwt.encode(payload, secret, algorithm=JWT_ALG)


def decode_token(token: str, secret: str) -> int | None:
    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALG])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError, TypeError):
        return None
