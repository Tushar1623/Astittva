#!/usr/bin/env python3
"""One-shot image optimizer for /app/frontend/public/images.

For every JPG/PNG in the folder, produces:
  - <name>.webp        (max 1920w, quality 82)   → desktop / retina
  - <name>-mobile.webp (max 720w,  quality 78)   → phones / small viewports

Originals are kept so `<picture>` sources can fall back if needed, but the
new .webp files are ~85-90% smaller. Skips files that already have a fresh
.webp sibling (uses mtime to detect staleness).
"""
from __future__ import annotations
import os
import sys
from pathlib import Path
from PIL import Image

ROOT = Path("/app/frontend/public/images")
DESKTOP_MAX_W = 1920
MOBILE_MAX_W = 720
DESKTOP_Q = 82
MOBILE_Q = 78


def resize_to_width(im: Image.Image, target_w: int) -> Image.Image:
    if im.width <= target_w:
        return im.copy()
    ratio = target_w / im.width
    new_size = (target_w, int(im.height * ratio))
    return im.resize(new_size, Image.LANCZOS)


def process(src: Path) -> None:
    desktop_out = src.with_suffix(".webp")
    mobile_out = src.with_name(src.stem + "-mobile.webp")

    # Skip if both outputs exist and are newer than the source
    src_mtime = src.stat().st_mtime
    if (
        desktop_out.exists()
        and mobile_out.exists()
        and desktop_out.stat().st_mtime > src_mtime
        and mobile_out.stat().st_mtime > src_mtime
    ):
        print(f"  skip (fresh) {src.name}")
        return

    try:
        with Image.open(src) as im:
            im = im.convert("RGB")

            desktop = resize_to_width(im, DESKTOP_MAX_W)
            desktop.save(desktop_out, "WEBP", quality=DESKTOP_Q, method=6)

            mobile = resize_to_width(im, MOBILE_MAX_W)
            mobile.save(mobile_out, "WEBP", quality=MOBILE_Q, method=6)

            orig_kb = src.stat().st_size / 1024
            d_kb = desktop_out.stat().st_size / 1024
            m_kb = mobile_out.stat().st_size / 1024
            print(
                f"  {src.name:40s}  {orig_kb:7.0f}KB → desktop {d_kb:6.0f}KB · mobile {m_kb:5.0f}KB"
            )
    except Exception as e:
        print(f"  FAIL {src.name}: {e}", file=sys.stderr)


def main() -> None:
    if not ROOT.exists():
        print(f"images dir not found: {ROOT}", file=sys.stderr)
        sys.exit(1)

    total_before = 0
    total_after = 0
    for p in sorted(ROOT.rglob("*")):
        if p.is_dir():
            continue
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        total_before += p.stat().st_size
        process(p)

    for p in sorted(ROOT.rglob("*.webp")):
        total_after += p.stat().st_size

    print()
    print(f"Total originals:   {total_before/1024/1024:6.1f} MB")
    print(f"Total WebP output: {total_after/1024/1024:6.1f} MB")
    print(f"Saved:             {(total_before-total_after)/1024/1024:6.1f} MB")


if __name__ == "__main__":
    main()
