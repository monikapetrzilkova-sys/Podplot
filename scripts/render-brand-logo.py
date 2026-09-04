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


def og_svg(size: int = 1200, pad: int = 96) -> str:
    inner = size - 2 * pad
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" fill="{GREEN}"/>
  <svg x="{pad}" y="{pad - 24}" width="{inner}" height="{inner}" viewBox="0 0 512 512">
    {mark_inner(WHITE)}
  </svg>
</svg>
"""


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

    og_path = PUBLIC / "og-image.svg"
    og_path.write_text(og_svg(), encoding="utf-8")
    rasterize_file(rsvg, og_path, PUBLIC / "og-image.png", 1200)

    rasterize(rsvg, square_icon_svg(512, 0.08), ICONS / "icon-512.png", 512)
    rasterize(rsvg, square_icon_svg(512, 0.12), ICONS / "icon-512-maskable.png", 512)
    rasterize(rsvg, square_icon_svg(192, 0.08), ICONS / "icon-192.png", 192)
    rasterize(rsvg, square_icon_svg(180, 0.08), PUBLIC / "apple-touch-icon.png", 180)

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
