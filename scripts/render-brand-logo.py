#!/usr/bin/env python3
"""Render the vector Podplot mark to OG image, PWA icons, and in-app assets."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"
ASSETS = ROOT / "src" / "assets"
MARK_SVG = PUBLIC / "logo-podplot.svg"
PREVIEW_SOURCE = PUBLIC / "logo-podplot-preview-source.jpg"
OG_SIZE = 1200
GREEN = "#1B4D3E"
WHITE = "#ffffff"


def require_rsvg() -> str:
    exe = shutil.which("rsvg-convert")
    if not exe:
        sys.exit("rsvg-convert is required (librsvg2-bin).")
    return exe


def mark_inner(color: str) -> str:
    raw = MARK_SVG.read_text(encoding="utf-8")
    inner = re.sub(r"^[\s\S]*?<svg[^>]*>", "", raw, count=1)
    inner = inner.replace("</svg>", "")
    return inner.replace("currentColor", color)


def write_colored_mark(path: Path, color: str) -> None:
    path.write_text(
        MARK_SVG.read_text(encoding="utf-8").replace("currentColor", color),
        encoding="utf-8",
    )


def og_svg(size: int = 1200, pad: int = 120) -> str:
    """WhatsApp/Messenger: large square card, vector mark with room around it."""
    inner = size - 2 * pad
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" fill="{GREEN}"/>
  <svg x="{pad}" y="{pad - 16}" width="{inner}" height="{inner}" viewBox="0 0 512 512">
    {mark_inner(WHITE)}
  </svg>
</svg>
"""


def downscale_png(src: Path, dest: Path, width: int, height: int) -> None:
    from PIL import Image

    im = Image.open(src).convert("RGB")
    im = im.resize((width, height), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="PNG", optimize=True)


def preview_mark_rgb() -> "Image.Image":
    """Clean JPEG grain on the supplied mark, keep the white line texture."""
    import numpy as np
    from PIL import Image

    im = Image.open(PREVIEW_SOURCE).convert("RGB")
    side = min(im.size)
    left = (im.width - side) // 2
    top = (im.height - side) // 2
    im = im.crop((left, top, left + side, top + side))
    arr = np.asarray(im, dtype=np.float32)
    corners = np.concatenate(
        [
            arr[:24, :24].reshape(-1, 3),
            arr[:24, -24:].reshape(-1, 3),
            arr[-24:, :24].reshape(-1, 3),
            arr[-24:, -24:].reshape(-1, 3),
        ]
    )
    bg = np.median(corners, axis=0)
    dist = np.linalg.norm(arr - bg, axis=2)
    is_bg = dist < 36
    arr = arr.copy()
    arr[is_bg] = bg
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def save_preview_png(im: "Image.Image", dest: Path, size: int) -> None:
    from PIL import Image

    out = im.resize((size, size), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, format="PNG", optimize=True)


def render_preview_assets() -> None:
    if not PREVIEW_SOURCE.exists():
        sys.exit(f"missing preview source {PREVIEW_SOURCE}")
    mark = preview_mark_rgb()
    ICONS.mkdir(parents=True, exist_ok=True)
    save_preview_png(mark, PUBLIC / "og-image.png", OG_SIZE)
    save_preview_png(mark, ICONS / "icon-512.png", 512)
    save_preview_png(mark, ICONS / "icon-512-maskable.png", 512)
    save_preview_png(mark, ICONS / "icon-192.png", 192)
    save_preview_png(mark, PUBLIC / "apple-touch-icon.png", 180)
    print("rendered preview assets from", PREVIEW_SOURCE.relative_to(ROOT))


def square_icon_svg(size: int, pad_ratio: float) -> str:
    pad = round(size * pad_ratio)
    inner = size - 2 * pad
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" fill="{GREEN}"/>
  <svg x="{pad}" y="{pad}" width="{inner}" height="{inner}" viewBox="0 0 512 512">
    {mark_inner(WHITE)}
  </svg>
</svg>
"""


def rasterize(rsvg: str, svg_text: str, out: Path, width: int, height: int | None = None) -> None:
    height = height or width
    tmp = out.with_suffix(".tmp.svg")
    tmp.write_text(svg_text, encoding="utf-8")
    subprocess.check_call([rsvg, "-w", str(width), "-h", str(height), str(tmp), "-o", str(out)])
    tmp.unlink(missing_ok=True)


def rasterize_file(rsvg: str, svg_path: Path, out: Path, width: int, height: int | None = None) -> None:
    height = height or width
    subprocess.check_call(
        [rsvg, "-w", str(width), "-h", str(height), str(svg_path), "-o", str(out)]
    )


def main() -> None:
    rsvg = require_rsvg()
    ICONS.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    render_preview_assets()

    write_colored_mark(ASSETS / "logo-podplot.svg", WHITE)
    write_colored_mark(ASSETS / "logo-podplot-green.svg", GREEN)
    rasterize_file(rsvg, ASSETS / "logo-podplot.svg", ASSETS / "logo-podplot.png", 1024)
    rasterize_file(rsvg, ASSETS / "logo-podplot-green.svg", ASSETS / "logo-podplot-green.png", 1024)
    shutil.copyfile(ASSETS / "logo-podplot.svg", PUBLIC / "logo-podplot-white.svg")
    shutil.copyfile(ASSETS / "logo-podplot-green.svg", PUBLIC / "logo-podplot-green.svg")
    rasterize_file(rsvg, ASSETS / "logo-podplot.svg", PUBLIC / "logo-podplot.png", 1024)
    rasterize_file(rsvg, ASSETS / "logo-podplot.svg", PUBLIC / "logo-podplot-white-lines.png", 1024)

    print("rendered OG image, icons, and logo assets from", MARK_SVG.relative_to(ROOT))


if __name__ == "__main__":
    main()
