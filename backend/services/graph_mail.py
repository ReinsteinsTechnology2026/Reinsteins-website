import os
import requests
import msal
from dotenv import load_dotenv

load_dotenv()

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

FROM_EMAIL = os.getenv("FROM_EMAIL")
TO_EMAIL = os.getenv("TO_EMAIL")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["https://graph.microsoft.com/.default"]


def get_access_token():
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
    )

    result = app.acquire_token_for_client(scopes=SCOPE)

    if "access_token" not in result:
        raise Exception(result.get("error_description", "Unable to get access token"))

    return result["access_token"]


def send_contact_email(full_name, email, phone, company, message):

    token = get_access_token()

    endpoint = f"https://graph.microsoft.com/v1.0/users/{FROM_EMAIL}/sendMail"

    html_body = f"""
    <html>
    <body style="font-family:Arial,sans-serif">
        <h2>New Website Enquiry</h2>

        <table cellpadding="8">

            <tr>
                <td><b>Name</b></td>
                <td>{full_name}</td>
            </tr>

            <tr>
                <td><b>Email</b></td>
                <td>{email}</td>
            </tr>

            <tr>
                <td><b>Phone</b></td>
                <td>{phone}</td>
            </tr>

            <tr>
                <td><b>Company</b></td>
                <td>{company}</td>
            </tr>

            <tr>
                <td><b>Requirement</b></td>
                <td>{message}</td>
            </tr>

        </table>

    </body>
    </html>
    """

    payload = {
        "message": {
            "subject": f"New Website Enquiry - {full_name}",
            "body": {
                "contentType": "HTML",
                "content": html_body
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": TO_EMAIL
                    }
                }
            ]
        },
        "saveToSentItems": True
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(endpoint, headers=headers, json=payload)

    if response.status_code != 202:
        raise Exception(response.text)

    return True