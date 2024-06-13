#!/usr/bin/env python3

## Carbonator Control System
### JWT Handling
### Developed by R2 Labs for Seabound Carbon

import time, jwt
from datetime import datetime, timedelta

def signJWT(username: str, authenticated: bool, secret: str, algorithm: str):
    payload = {
        "username": username,
        "expiration": (datetime.now() + timedelta(seconds=600)).isoformat(),
        "authenticated": authenticated
    }

    token = jwt.encode(payload=payload, key=secret, algorithm=algorithm)
    return token

def decodeJWT(token: str, secret: str, algorithm: str):
    try:
      decode_token = jwt.decode(token, secret, algorithms=algorithm)
      return decode_token if decode_token['expiration'] >= time.time() else None
    except:
        return {}