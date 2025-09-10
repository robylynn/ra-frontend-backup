# ./api/auth_router.py
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from loguru import logger
import asyncpg
from asyncpg.pool import Pool as AsyncpgPool

from api.models import UserCreate, User, UserInDB, Token, TokenData
from common_models.models import ApiResponse
from utilities.password_utils import verify_password, get_password_hash
from api.schema_models import (
    LOADED_RAW_SCHEMA,
)  # To check if 'users' table is in schema

# --- Configuration from Environment Variables ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-default-key-please-change")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# --- OAuth2PasswordBearer for JWT handling ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


# --- Create an API Router for Authentication ---
auth_router = APIRouter(
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)


# --- Helper Function: Get Database Connection ---
async def get_db_connection(request: Request) -> AsyncpgPool:
    """Dependency to get the local database connection pool."""
    if (
        not hasattr(request.app.state, "local_db_pool")
        or request.app.state.local_db_pool is None
    ):
        logger.error("Database pool not initialized in app.state.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database pool not initialized.",  # SIMPLIFIED: Changed to string
        )
    return request.app.state.local_db_pool


# --- User Management Functions ---
async def get_user(db_pool: AsyncpgPool, username: str) -> Optional[UserInDB]:
    """Retrieves a user by username from the database."""
    async with db_pool.acquire() as conn:
        record = await conn.fetchrow(
            "SELECT user_id, username, hashed_password, created_at FROM users WHERE username = $1;",
            username,
        )
        if record:
            return UserInDB(**record)
    return None


async def create_new_user(db_pool: AsyncpgPool, user: UserCreate) -> User:
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    new_user_id = uuid.uuid4()
    created_at = datetime.now(timezone.utc)

    insert_sql = "INSERT INTO users (user_id, username, hashed_password, created_at) VALUES ($1, $2, $3, $4) RETURNING user_id, username, created_at;"
    try:
        async with db_pool.acquire() as conn:
            record = await conn.fetchrow(
                insert_sql, new_user_id, user.username, hashed_password, created_at
            )
            if record:
                return User(**record)
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered.",  # SIMPLIFIED: Changed to string
        )
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during user registration: {e}",  # SIMPLIFIED: Changed to string
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to create user (no record returned).",  # SIMPLIFIED: Changed to string
    )


# --- Authentication and Token Functions ---
async def authenticate_user(
    db_pool: AsyncpgPool, username: str, password: str
) -> Optional[UserInDB]:
    """Authenticates a user by username and password."""
    user = await get_user(db_pool, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db_pool: AsyncpgPool = Depends(get_db_connection),
) -> Optional[User]:
    """
    Dependency to get the current authenticated user from a JWT token.
    Returns the User object if authenticated, otherwise returns None.
    Does NOT raise HTTPException directly, allowing optional dependencies to work.
    """
    if token is None:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.warning("JWT payload missing 'sub' (username).")
            return None
        token_data = TokenData(username=username)
    except JWTError:
        logger.warning("Invalid JWT token provided.")
        return None

    user_in_db = await get_user(db_pool, token_data.username)
    if user_in_db is None:
        logger.warning(
            f"User '{token_data.username}' from token not found in database."
        )
        return None

    return User(
        user_id=user_in_db.user_id,
        username=user_in_db.username,
        created_at=user_in_db.created_at,
    )


# --- API Endpoints ---


@auth_router.post(
    "/register", summary="Register a new user", response_model=ApiResponse
)
async def register_user(
    request: Request,
    user_create: UserCreate,
    db_pool: AsyncpgPool = Depends(get_db_connection),
):
    """
    Register a new user with a username and password.
    Returns the newly created user's details (excluding password hash).
    """
    # Explicitly handle OPTIONS preflight request
    if request.method == "OPTIONS":
        logger.info(
            "Auth Router: Received OPTIONS request for /register. Returning 200 OK."
        )
        return Response(status_code=status.HTTP_200_OK)

    logger.info(
        f"Auth Router: /register endpoint hit. Method: {request.method}. Attempting to register new user: {user_create.username}"
    )
    logger.debug(f"Auth Router: Received user_create data: {user_create.model_dump()}")

    if LOADED_RAW_SCHEMA is None or "users" not in LOADED_RAW_SCHEMA.tables:
        logger.error("Users table not defined in schema.yml. Cannot register users.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration service not configured (users table missing).",  # SIMPLIFIED: Changed to string
        )

    user = await get_user(db_pool, user_create.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered.",  # SIMPLIFIED: Changed to string
        )

    new_user = await create_new_user(db_pool, user_create)
    return ApiResponse(
        success=True,
        message="User registered successfully.",
        data=(
            new_user.model_dump(exclude_unset=True)
            if hasattr(new_user, "model_dump")
            else new_user.dict(exclude_unset=True)
        ),
    )


@auth_router.post(
    "/token", summary="Generate JWT Access Token", response_model=ApiResponse
)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db_pool: AsyncpgPool = Depends(get_db_connection),
):
    """
    Authenticate a user and return a JWT access token.
    The token will also be set as an HttpOnly cookie.
    """
    logger.info(f"Attempting to authenticate user: {form_data.username}")
    user = await authenticate_user(db_pool, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",  # SIMPLIFIED: Changed to string
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.user_id)},
        expires_delta=access_token_expires,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=int(access_token_expires.total_seconds()),
        expires=int(access_token_expires.total_seconds()),
        samesite="Lax",
        secure=os.getenv("ENVIRONMENT") == "production",
        path="/",
    )

    logger.info(f"User {user.username} authenticated successfully.")
    return ApiResponse(
        success=True,
        message="Login successful.",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": (
                user.model_dump(exclude={"hashed_password"})
                if hasattr(user, "model_dump")
                else user.dict(exclude={"hashed_password"})
            ),
        },
    )


@auth_router.get(
    "/users/me", summary="Get current authenticated user", response_model=ApiResponse
)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve the current authenticated user's details.
    This endpoint requires a valid JWT token.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",  # SIMPLIFIED: Changed to string
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info(f"Retrieving details for current user: {current_user.username}")
    return ApiResponse(
        success=True,
        message="Current user details retrieved.",
        data=(
            current_user.model_dump(exclude_unset=True)
            if hasattr(current_user, "model_dump")
            else current_user.dict(exclude_unset=True)
        ),
    )


@auth_router.post("/logout", summary="Logout user", response_model=ApiResponse)
async def logout(
    response: Response, current_user: Optional[User] = Depends(get_current_user)
):
    """
    Logs out the current user by clearing the HttpOnly access token cookie.
    """
    if current_user:
        logger.info(f"User {current_user.username} logging out.")
    else:
        logger.info(
            "Attempting to log out unauthenticated user (clearing potential stale cookie)."
        )

    response.delete_cookie(key="access_token", path="/")
    return ApiResponse(success=True, message="Logged out successfully.")
