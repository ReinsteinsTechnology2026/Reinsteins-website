from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

from schemas.contact import ContactRequest
from services.graph_mail import send_contact_email, send_resume_email

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


CAREERS_EMAIL = os.getenv("CAREERS_EMAIL", "careers@reinsteins.com")

MAX_RESUME_SIZE = 2 * 1024 * 1024  # 2 MB

ALLOWED_RESUME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@app.post("/careers/apply")
async def careers_apply(
    subject: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    resume: UploadFile = File(...)
):

    if resume.content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Resume must be a PDF or Word document (.pdf, .doc, .docx)."
        )

    file_bytes = await resume.read()

    if len(file_bytes) > MAX_RESUME_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Resume file size must not exceed 2MB."
        )

    send_resume_email(
        name,
        subject,
        description,
        resume.filename,
        file_bytes,
        resume.content_type,
        CAREERS_EMAIL
    )

    return {
        "success": True,
        "message": "Thank you for your interest. Your resume has been submitted to Reinsteins Technologies & Solutions."
    }
