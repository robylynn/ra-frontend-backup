#!/usr/bin/env python3

## Carbonator Control System
### JWT Bearer
### Developed by R2 Labs for Seabound Carbon

from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth.jwt_handler import decodeJWT


class JWTBearer(HTTPBearer):
    def __init__(self, auto_Error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_Error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, details="Invalid or Expired Token")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, details="Invalid or Expired Token")

    def verify_jwt(self, jwttoken: str):
        isTokenValid: bool = False
        payload = decodeJWT(jwttoken)
        if payload:
            isTokenValid = True
        return isTokenValid
