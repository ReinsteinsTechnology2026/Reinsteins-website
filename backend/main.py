from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

from schemas.contact import ContactRequest
from services.graph_mail import send_contact_email

from auth.auth import router as auth_router


# Load environment variables
load_dotenv()

app = FastAPI(
    title="Reinsteins Technologies & Solutions API",
    version="1.0.0"
)

# Session Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv(
        "SESSION_SECRET",
        "reinsteins-secret-key"
    )
)

# Authentication Router
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "company": "Reinsteins Technologies & Solutions",
        "status": "Running"
    }


@app.post("/contact")
def contact(request: ContactRequest):

    send_contact_email(
        request.full_name,
        request.email,
        request.phone,
        request.company,
        request.message
    )

    return {
        "success": True,
        "message": "Thank you for contacting Reinsteins Technologies & Solutions. Our team will contact you shortly."
    }
