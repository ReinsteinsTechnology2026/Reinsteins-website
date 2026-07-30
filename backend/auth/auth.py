import os

from dotenv import load_dotenv

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse

from authlib.integrations.starlette_client import OAuth

load_dotenv()

router = APIRouter()

# ===========================
# Environment Variables
# ===========================

AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")

BASE_URL = os.getenv("BASE_URL")
REDIRECT_URI = os.getenv("AZURE_REDIRECT_URI")

ALLOWED_ADMIN_EMAIL = os.getenv("ALLOWED_ADMIN_EMAIL")

# ===========================
# OAuth Configuration
# ===========================

oauth = OAuth()

oauth.register(
    name="microsoft",
    client_id=AZURE_CLIENT_ID,
    client_secret=AZURE_CLIENT_SECRET,

    server_metadata_url=f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration",

    client_kwargs={
        "scope": "openid profile email User.Read"
    }
)