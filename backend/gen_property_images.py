"""Generate 3 distinct luxury property card images so the Properties grid doesn't repeat.
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
    "Warm bright daylight, golden hour lighting, champagne and ivory tones. "
    "Premium architecture. Wide cinematic 16:9 frame. Magazine-quality. "
    "NO dark sky, NO night, NO blue, NO moody atmosphere. Bright, elegant, aspirational. "
)

PROMPTS = [
    ("property_tower",
     "Premium contemporary luxury high-rise residential tower at golden hour. "
     "Floor-to-ceiling glass facade, warm beige stone podium, landscaped sky-garden terraces, "
     "soft champagne sky reflecting off the building. Wide vertical building shot. "
     "Aman Residences / Four Seasons aesthetic. "),
    ("property_villa_garden",
     "Premium contemporary luxury villa exterior at warm afternoon daylight. "
     "Modern architecture with warm wood and stone accents, manicured Japanese-inspired "
     "garden with stepping-stone path, lush green landscaping, soft warm lighting on facade. "
     "Editorial architectural photograph. "),
    ("property_heritage_estate",
     "Premium heritage-inspired luxury Kolkata estate at golden hour. "
     "Restored colonial architecture with warm cream and beige facade, ornate pillars and "
     "balconies, mature trees in landscaped grounds, soft sunset light, fountain in foreground. "
     "Sotheby's heritage listing photography. "),
]


async def generate(slug: str, prompt: str):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = (
        LlmChat(api_key=api_key, session_id=f"prop-{slug}-{int(time.time())}",
                system_message="You are a world-class editorial photography generator.")
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    print(f"[gen] {slug} ...", flush=True)
    try:
        _t, images = await chat.send_message_multimodal_response(UserMessage(text=STYLE + prompt))
    except Exception as e:
        print(f"[err] {slug}: {e}", flush=True)
        return None
    if not images:
        return None
    out = OUT_DIR / f"{slug}.jpg"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[ok] {slug} -> {out}", flush=True)
    return out


async def main():
    res = await asyncio.gather(*(generate(s, p) for s, p in PROMPTS), return_exceptions=True)
    print(f"=== DONE: {sum(1 for r in res if isinstance(r, Path))}/{len(PROMPTS)} ===", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
