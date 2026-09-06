"""Generate additional Kolkata landmark images for rotating hero."""
import asyncio
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT = Path(__file__).parent
load_dotenv(ROOT / '.env')
OUT = Path(os.getenv(
    "IMAGE_OUT_DIR",
    str(Path(__file__).parent.parent / "generated_images"),
))
OUT.mkdir(parents=True, exist_ok=True)

PROMPTS = {
    "howrah-bridge.png": (
        "Cinematic luxury photograph of Howrah Bridge in Kolkata at twilight. "
        "The iconic cantilever steel truss bridge spanning the Hooghly River, illuminated with warm amber light. "
        "Deep indigo evening sky, dramatic golden reflections on water below, soft mist over the river, "
        "wide cinematic aspect, editorial real-estate magazine quality, premium dark moody composition, "
        "no people in foreground, no text, no logos."
    ),
    "victoria-memorial.png": (
        "Cinematic luxury photograph of Victoria Memorial in Kolkata at golden hour. "
        "The grand white marble palace with central dome and surrounding manicured gardens, warm copper-amber sunset glow. "
        "Dramatic colonnaded architecture, lush green lawns, soft cinematic light, "
        "wide aspect, editorial real-estate magazine quality, no people, no text, no logos."
    ),
    "new-town-skyline.png": (
        "Cinematic aerial luxury photograph of New Town Kolkata skyline at blue hour. "
        "Modern glass tower business district with warm interior lights twinkling, wide boulevards, "
        "premium residential and commercial high-rises against deep indigo evening sky, "
        "subtle copper warmth in the windows, editorial luxury magazine aesthetic, no text, no logos."
    ),
    "eco-park-kolkata.png": (
        "Cinematic luxury photograph of Eco Park New Town Kolkata at twilight. "
        "Landscaped lakefront, modern walking pathways, warm golden street-lamp lighting reflecting on calm water, "
        "manicured trees and contemporary park architecture, indigo evening sky with copper highlights, "
        "wide cinematic aspect, premium magazine quality, no people in foreground, no text, no logos."
    ),
}


async def gen(filename, prompt):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id=f"astittva-{filename}", system_message="You are a luxury architectural photographer.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=prompt)
    _, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"FAIL {filename}")
        return
    for img in images:
        out = OUT / filename
        out.write_bytes(base64.b64decode(img["data"]))
        print(f"Saved {out}")
        break


async def main():
    await asyncio.gather(*[gen(fn, pr) for fn, pr in PROMPTS.items()])


if __name__ == "__main__":
    asyncio.run(main())
