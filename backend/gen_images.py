"""Generate Biswa Bangla Gate + City Centre 2 Rajarhat images for Astitva."""
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
    "biswa-bangla-hero.png": (
        "Editorial luxury architectural photograph of the iconic Biswa Bangla Gate in New Town Kolkata at twilight. "
        "A monumental elliptical steel sculpture: two soaring parabolic arches intersecting at the apex over a wide modern road, "
        "with a horizontal circular illuminated walkway suspended in the centre glowing in warm amber light. "
        "Deep navy-blue evening sky transitioning to dusk, dramatic floodlight star-bursts from street lamps below, "
        "elegant urban skyline silhouette in the distance, wide-angle architectural perspective from below looking up, "
        "ultra-sharp, cinematic, premium real-estate magazine quality, no people, no text, no logos."
    ),
    "biswa-bangla-newtown.png": (
        "Cinematic night photograph of the Biswa Bangla Gate landmark in New Town Kolkata. "
        "Two graceful parabolic steel arches forming an ellipse with a circular illuminated viewing ring at the centre lit in warm gold, "
        "set against a deep cobalt evening sky, surrounded by manicured boulevards and modern skyline beyond. "
        "Vertical portrait composition, dramatic lighting, luxury architectural style, "
        "ultra high resolution, no text, no logos."
    ),
    "city-centre-2-rajarhat.png": (
        "Architectural photograph of City Centre 2 mall in Rajarhat New Town Kolkata at twilight. "
        "Modern contemporary shopping mall exterior with elegant facades, illuminated entrance, "
        "warm golden interior lights spilling through large glass windows, landscaped front plaza with palm trees, "
        "dusky purple-blue sky, sleek modernist architecture, vertical portrait composition, "
        "luxury real-estate magazine photography style, no people in foreground, no readable text, no logos."
    ),
}


async def gen(filename, prompt):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id=f"astitva-{filename}", system_message="You are a luxury architectural photographer.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=prompt)
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"FAIL {filename}: no image returned. Text={text[:200]}")
        return
    for img in images:
        out = OUT / filename
        out.write_bytes(base64.b64decode(img["data"]))
        print(f"Saved {out}")
        break


async def main():
    for fn, prompt in PROMPTS.items():
        try:
            await gen(fn, prompt)
        except Exception as e:  # noqa
            print(f"Error generating {fn}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
