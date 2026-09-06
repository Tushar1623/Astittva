"""One-shot generator for Astittva Marketing luxury light-theme hero imagery.

Generates 5 hero slideshow images using Gemini Nano Banana, saved to
/app/frontend/public/images/luxe/. All prompts are tuned for warm ivory
+ golden hour + Sotheby's-grade editorial photography, matching the light theme.

Run: python /app/backend/gen_hero_images.py
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

BRAND_STYLE_PREFIX = (
    "Cinematic luxury editorial photograph for Sotheby's / Aman Residences / "
    "Four Seasons calibre real estate brand. Warm ivory and champagne tones. "
    "Golden hour lighting. Soft natural light. Warm white sky. Subtle copper "
    "and bronze highlights. Clean composition. Wide 16:9 aspect ratio. "
    "Professional architectural photography style. No harsh shadows, no dark "
    "moody atmosphere, no night scenes, no heavy blue tones. Premium magazine quality. "
)

SLIDES = [
    (
        "biswa_bangla_gate",
        "Biswa Bangla Gate New Town Kolkata photographed at golden hour from a "
        "low angle. The circular elevated viewing gallery glows warm gold. Soft "
        "cream sky behind. Warm sunrise haze. Wide cinematic frame. ",
    ),
    (
        "howrah_bridge",
        "Howrah Bridge Kolkata photographed at golden hour from the river bank. "
        "The cantilever bridge structure glows in warm orange and bronze tones. "
        "Soft warm sky. The Hooghly river reflecting golden light. "
        "Cinematic editorial wide shot. ",
    ),
    (
        "victoria_memorial",
        "Victoria Memorial Kolkata photographed at sunrise. The white marble dome "
        "and structure illuminated by warm golden light. Manicured lawns in the "
        "foreground. Soft cream and champagne sky. No tourists. Pristine "
        "architectural editorial photography. ",
    ),
    (
        "new_town_skyline",
        "Modern luxury residential skyline in New Town Kolkata at golden hour. "
        "Premium glass and stone high-rise towers in warm light. Cream and "
        "champagne sky. Bright and elegant. Magazine-quality architectural "
        "photograph. No dark or moody atmosphere. ",
    ),
    (
        "luxury_villa",
        "Premium contemporary luxury villa exterior at golden hour. Large floor-"
        "to-ceiling glass windows, warm beige stone facade, manicured landscaping, "
        "infinity pool reflecting warm sky. Soft cream lighting. Aman Residences "
        "/ Four Seasons aesthetic. Editorial architectural photography. ",
    ),
]


async def generate(slug: str, prompt: str) -> Path | None:
    full_prompt = BRAND_STYLE_PREFIX + prompt
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing")
    chat = (
        LlmChat(api_key=api_key, session_id=f"hero-{slug}-{int(time.time())}",
                system_message="You are a world-class editorial photography generator.")
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    print(f"[gen] {slug} ...", flush=True)
    msg = UserMessage(text=full_prompt)
    try:
        text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:  # noqa: BLE001
        print(f"[err] {slug}: {e}", flush=True)
        return None
    if not images:
        print(f"[warn] {slug}: no images returned. text={text[:120]}", flush=True)
        return None
    img = images[0]
    image_bytes = base64.b64decode(img["data"])
    out = OUT_DIR / f"{slug}.jpg"
    out.write_bytes(image_bytes)
    print(f"[ok] {slug} -> {out} ({len(image_bytes)} bytes)", flush=True)
    return out


async def main() -> int:
    results = await asyncio.gather(
        *(generate(slug, prompt) for slug, prompt in SLIDES),
        return_exceptions=True,
    )
    ok = sum(1 for r in results if isinstance(r, Path))
    print(f"\n=== DONE: {ok}/{len(SLIDES)} images generated ===", flush=True)
    return 0 if ok == len(SLIDES) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
