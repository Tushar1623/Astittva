"""Generate 3 luxury property showcase images for Home page LOCATIONS section.
Bright daylight / golden hour, Architectural Digest / Sotheby's caliber.
"""
import asyncio
import base64
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

OUT_DIR = Path("/app/frontend/public/images/luxe")
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-3.1-flash-image-preview"

STYLE = (
    "Architectural Digest editorial photograph for Sotheby's luxury real estate brand. "
    "Warm bright daylight, soft golden hour lighting, champagne and ivory tones. "
    "Premium architecture. Wide cinematic 16:9 frame. Magazine-quality. "
    "NO dark sky, NO night, NO blue tones, NO moody atmosphere. "
    "Bright, elegant, aspirational. "
)

PROMPTS = [
    ("locations_newtown",
     "Premium future-ready luxury residential district in New Town Kolkata at golden hour. "
     "Modern high-rise glass and stone residential towers, palm-lined wide boulevard, "
     "manicured landscaping. Soft cream and champagne sky. Bright daylight. "),
    ("locations_rajarhat",
     "Modern premium mixed-use luxury commercial development at midday. "
     "Bright glass towers with warm beige stone accents, contemporary architecture, "
     "wide plaza with trees, fountain, soft cream sky. Bright daylight. "
     "Investment-grade commercial district. "),
    ("locations_kolkata",
     "Victoria Memorial Kolkata photographed at soft golden hour. "
     "White marble dome and structure glowing in warm sunlight, manicured lawns "
     "in foreground, champagne sky, no crowds. Heritage prestige editorial photography. "),
]


async def generate(slug: str, prompt: str) -> Path | None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = (
        LlmChat(api_key=api_key, session_id=f"loc-{slug}-{int(time.time())}",
                system_message="You are a world-class editorial photography generator.")
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    print(f"[gen] {slug} ...", flush=True)
    msg = UserMessage(text=STYLE + prompt)
    try:
        _text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f"[err] {slug}: {e}", flush=True)
        return None
    if not images:
        return None
    out = OUT_DIR / f"{slug}.jpg"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[ok] {slug} -> {out}", flush=True)
    return out


async def main() -> int:
    results = await asyncio.gather(
        *(generate(slug, p) for slug, p in PROMPTS), return_exceptions=True,
    )
    ok = sum(1 for r in results if isinstance(r, Path))
    print(f"=== DONE: {ok}/{len(PROMPTS)} ===", flush=True)
    return 0 if ok == len(PROMPTS) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
