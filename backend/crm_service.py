"""Astittva Marketing CRM integration service.

Single source of truth for outbound lead forwarding. API key and base URL come
from environment variables — never hardcode, never expose to the frontend.

Architecture:
    Frontend form  →  POST /api/leads (FastAPI)  →  forward_lead() (this file)  →  CRM webhook

Failure-isolation:
    The Mongo write happens FIRST so a CRM outage never loses a lead. The forward
    call is best-effort; failures are logged and the saved Mongo doc gets a
    `crm_status` field for offline retry / audit.
"""
from __future__ import annotations

import logging
import os
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger("astitva.crm")

# Tunables — all env-driven
CRM_TIMEOUT_SECS = 15.0
CRM_RETRIES = 1  # 1 retry on transient failures (timeout / 5xx)


def _cfg() -> Dict[str, str]:
    return {
        "base_url": (os.environ.get("CRM_BASE_URL") or "").rstrip("/"),
        "platform": os.environ.get("CRM_PLATFORM") or "astittva-website",
        "api_key": os.environ.get("CRM_API_KEY") or "",
        "env": os.environ.get("CRM_ENV") or "development",
    }


def _is_configured() -> bool:
    c = _cfg()
    return bool(c["base_url"] and c["api_key"])


# ---------------------------------------------------------------------------
# Lead-type classification & additionalNotes formatting
# ---------------------------------------------------------------------------
def _build_additional_notes(
    lead_type: str,
    project: Optional[str] = None,
    location: Optional[str] = None,
    preferred_date: Optional[str] = None,
    extra_message: Optional[str] = None,
) -> str:
    """Compose the additionalNotes block per Astittva CRM brief."""
    lines = [f"Lead Type: {lead_type}", "Source: Website"]
    if project:
        lines.append(f"Project: {project}")
    if location:
        lines.append(f"Location: {location}")
    if preferred_date:
        lines.append(f"Preferred Date: {preferred_date}")
    if extra_message:
        lines.append("")
        lines.append(f"Message: {extra_message}")
    return "\n".join(lines)


def _resolve_lead_type(source: str, project: Optional[str], form: Optional[str] = None) -> str:
    """Map internal `source` value → human-readable CRM lead type label.

    If an explicit `form` label is provided by the frontend (e.g. "Site Visit
    Enquiry"), it wins so CRM can distinguish enquiry channels precisely.
    """
    if form:
        return form
    s = (source or "").lower()
    if "site_visit" in s or "site-visit" in s:
        return "Site Visit Request"
    if "whatsapp" in s:
        return "WhatsApp Inquiry"
    if "property" in s or project:
        return "Property Inquiry"
    return "Consultation"


# ---------------------------------------------------------------------------
# Public: map our LeadIn → CRM payload
# ---------------------------------------------------------------------------
def build_crm_payload(lead: Dict[str, Any]) -> Dict[str, Any]:
    """Translate our internal lead dict into the CRM's expected schema."""
    project = lead.get("project") or lead.get("interest") or ""
    location = lead.get("property_location") or lead.get("preferred_locality") or ""

    lead_type = _resolve_lead_type(lead.get("source", ""), project, lead.get("form"))
    notes = _build_additional_notes(
        lead_type=lead_type,
        project=project or None,
        location=location or None,
        preferred_date=lead.get("preferred_date") or None,
        extra_message=lead.get("message") or None,
    )

    payload: Dict[str, Any] = {
        # Mandatory CRM fields
        "customerPrefix": lead.get("prefix") or "Mr",
        "customerFirstName": lead.get("first_name") or "",
        "customerLastName": lead.get("last_name") or "",
        "customerPhoneCode": lead.get("phone_code") or "+91",
        "customerPhone": lead.get("phone") or "",
        # Optional CRM fields
        "customerEmail": lead.get("email") or "",
        "preferredCity": lead.get("preferred_city") or "Kolkata",
        "preferredArea": lead.get("preferred_locality") or "",
        "propertyType": lead.get("property_type") or "",
        "budgetRange": lead.get("budget") or "",
        "purposeOfPurchase": lead.get("investment_purpose") or "",
        "additionalNotes": notes,
        "source": "website",
    }
    # Strip empty strings from optional fields so the CRM doesn't store noise
    return {k: v for k, v in payload.items() if v not in ("", None)}


# ---------------------------------------------------------------------------
# Outbound CRM call — best-effort, never raises into the request handler
# ---------------------------------------------------------------------------
async def forward_lead(lead: Dict[str, Any]) -> Dict[str, Any]:
    """POST a lead to the CRM. Returns a status dict; never raises.

    Return shape:
        { "ok": bool, "status": "sent"|"skipped"|"failed",
          "http_status": int|None, "error": str|None, "response": dict|None }
    """
    if not _is_configured():
        logger.warning("[crm] not configured (missing CRM_BASE_URL or CRM_API_KEY) — skipping forward")
        return {"ok": False, "status": "skipped", "http_status": None,
                "error": "CRM not configured", "response": None}

    cfg = _cfg()
    url = f"{cfg['base_url']}/webhook/{cfg['platform']}/lead"
    headers = {
        "X-Api-Key": cfg["api_key"],
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = build_crm_payload(lead)

    # Log without the API key, without PII beyond what's necessary
    logger.info(f"[crm] forwarding lead url={url} type={body.get('additionalNotes','').splitlines()[0] if body.get('additionalNotes') else 'n/a'}")

    last_err: Optional[str] = None
    for attempt in range(CRM_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=CRM_TIMEOUT_SECS) as client:
                resp = await client.post(url, json=body, headers=headers)
            if 200 <= resp.status_code < 300:
                try:
                    data = resp.json()
                except Exception:
                    data = {"raw": resp.text[:500]}
                logger.info(f"[crm] sent ok status={resp.status_code}")
                return {"ok": True, "status": "sent",
                        "http_status": resp.status_code, "error": None, "response": data}
            # 4xx → don't retry (client error); 5xx → retry once
            text = resp.text[:300]
            last_err = f"HTTP {resp.status_code}: {text}"
            logger.warning(f"[crm] non-2xx attempt={attempt+1} {last_err}")
            if resp.status_code < 500:
                break  # client error — payload issue, retrying won't help
        except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPError) as e:
            last_err = f"{type(e).__name__}: {e}"
            logger.warning(f"[crm] transport error attempt={attempt+1} {last_err}")
        except Exception as e:  # noqa: BLE001
            last_err = f"unexpected: {type(e).__name__}: {e}"
            logger.exception("[crm] unexpected error")
            break

    return {"ok": False, "status": "failed", "http_status": None,
            "error": last_err, "response": None}
