#!/usr/bin/env python3
"""
Generates the Android launcher icons from the BetPro brand mark.

Source of truth is the same bolt exported from Figma (src/assets/icons/bolt.svg)
on the 135° #1E88E5 → #4FC3F7 gradient used by the splash logo tile, so the app
icon matches the in-app mark exactly.

Writes:
  mipmap-<density>/ic_launcher.png             legacy square icon
  mipmap-<density>/ic_launcher_round.png       legacy round icon
  mipmap-<density>/ic_launcher_foreground.png  adaptive foreground (API 26+)
  mipmap-<density>/ic_launcher_background.png  adaptive background (API 26+)

Run:  python3 scripts/generate-app-icon.py
"""
import os
import re
import math
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOLT_SVG = os.path.join(ROOT, "src", "assets", "icons", "bolt.svg")
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")

GRADIENT_START = (30, 136, 229)   # #1E88E5
GRADIENT_END = (79, 195, 247)     # #4FC3F7

# Legacy icon sizes, and the 108dp adaptive layer sizes, per density.
DENSITIES = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}

SS = 4  # supersampling factor for smooth edges


# --------------------------------------------------------------------------
# Minimal SVG path reader. Supports M, L, H, V, C and Z in both absolute and
# relative form — enough for the Figma exports. Anything else raises, so an
# unhandled command fails loudly instead of silently distorting the glyph.
# --------------------------------------------------------------------------
LETTERS = "MmLlHhVvCcZz"


def parse_path(d):
    tokens = re.findall(rf"[{LETTERS}]|-?\d*\.?\d+(?:e-?\d+)?", d)
    unsupported = set(re.findall(r"[A-Za-z]", d)) - set(LETTERS)
    if unsupported:
        raise ValueError(f"unsupported path commands: {sorted(unsupported)}")

    points, cursor, start, i = [], (0.0, 0.0), (0.0, 0.0), 0
    cmd = None

    def num():
        nonlocal i
        v = float(tokens[i])
        i += 1
        return v

    def pt(rel):
        x, y = num(), num()
        return (cursor[0] + x, cursor[1] + y) if rel else (x, y)

    while i < len(tokens):
        if tokens[i] in LETTERS:
            cmd = tokens[i]
            i += 1
            if cmd in "Zz":
                cursor = start
            continue

        rel = cmd.islower()
        if cmd in "Mm":
            cursor = pt(rel)
            start = cursor
            points.append(cursor)
            cmd = "l" if rel else "L"  # further pairs are implicit linetos
        elif cmd in "Ll":
            cursor = pt(rel)
            points.append(cursor)
        elif cmd in "Hh":
            x = num()
            cursor = (cursor[0] + x if rel else x, cursor[1])
            points.append(cursor)
        elif cmd in "Vv":
            y = num()
            cursor = (cursor[0], cursor[1] + y if rel else y)
            points.append(cursor)
        elif cmd in "Cc":
            p1, p2, p3 = pt(rel), pt(rel), pt(rel)
            points.extend(flatten_cubic(cursor, p1, p2, p3))
            cursor = p3
        else:
            raise ValueError(f"unhandled command {cmd!r}")
    return points


def flatten_cubic(p0, p1, p2, p3, steps=24):
    out = []
    for s in range(1, steps + 1):
        t = s / steps
        mt = 1 - t
        x = (mt**3) * p0[0] + 3 * (mt**2) * t * p1[0] + 3 * mt * (t**2) * p2[0] + (t**3) * p3[0]
        y = (mt**3) * p0[1] + 3 * (mt**2) * t * p1[1] + 3 * mt * (t**2) * p2[1] + (t**3) * p3[1]
        out.append((x, y))
    return out


def read_bolt():
    svg = open(BOLT_SVG).read()
    d = re.search(r'\sd="([^"]+)"', svg).group(1)
    view = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    stroke = float(re.search(r'stroke-width="([\d.]+)"', svg).group(1))
    return parse_path(d), float(view.group(1)), stroke


# --------------------------------------------------------------------------
def gradient(size):
    """135° linear gradient — start at top-left, end at bottom-right."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = tuple(
                round(GRADIENT_START[c] + (GRADIENT_END[c] - GRADIENT_START[c]) * t)
                for c in range(3)
            )
    return img


def draw_bolt(size, coverage):
    """White bolt, centred, occupying `coverage` of the canvas. Returns RGBA."""
    pts, view, stroke_w = read_bolt()
    big = size * SS
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    scale = (big * coverage) / view
    offset = (big - view * scale) / 2
    scaled = [(x * scale + offset, y * scale + offset) for x, y in pts]

    # The export is filled *and* stroked in white; reproduce both so the
    # glyph keeps its designed weight.
    draw.polygon(scaled, fill=(255, 255, 255, 255))
    draw.line(
        scaled + [scaled[0]],
        fill=(255, 255, 255, 255),
        width=max(1, round(stroke_w * scale)),
        joint="curve",
    )
    return layer.resize((size, size), Image.LANCZOS)


def rounded_mask(size, radius_ratio):
    big = size * SS
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, big - 1, big - 1], radius=int(big * radius_ratio), fill=255
    )
    return mask.resize((size, size), Image.LANCZOS)


def circle_mask(size):
    big = size * SS
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, big - 1, big - 1], fill=255)
    return mask.resize((size, size), Image.LANCZOS)


def main():
    for density, (legacy, adaptive) in DENSITIES.items():
        out = os.path.join(RES, "mipmap-" + density)
        os.makedirs(out, exist_ok=True)

        # --- legacy square: rounded tile, matching the in-app logo (24/96 radius)
        base = gradient(legacy).convert("RGBA")
        icon = Image.new("RGBA", (legacy, legacy), (0, 0, 0, 0))
        icon.paste(base, (0, 0), rounded_mask(legacy, 24 / 96))
        icon.alpha_composite(draw_bolt(legacy, 0.46))
        icon.save(os.path.join(out, "ic_launcher.png"))

        # --- legacy round
        rnd = Image.new("RGBA", (legacy, legacy), (0, 0, 0, 0))
        rnd.paste(base, (0, 0), circle_mask(legacy))
        rnd.alpha_composite(draw_bolt(legacy, 0.42))
        rnd.save(os.path.join(out, "ic_launcher_round.png"))

        # --- adaptive layers (108dp; only the centre 72dp is guaranteed visible)
        gradient(adaptive).save(os.path.join(out, "ic_launcher_background.png"))
        draw_bolt(adaptive, 0.34).save(
            os.path.join(out, "ic_launcher_foreground.png")
        )

        print(f"{density:8} legacy {legacy}px  adaptive {adaptive}px")

    # --- adaptive icon descriptors
    anydpi = os.path.join(RES, "mipmap-anydpi-v26")
    os.makedirs(anydpi, exist_ok=True)
    xml = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '    <background android:drawable="@mipmap/ic_launcher_background"/>\n'
        '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
        "</adaptive-icon>\n"
    )
    for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
        with open(os.path.join(anydpi, name), "w") as f:
            f.write(xml)
    print("wrote mipmap-anydpi-v26/ic_launcher.xml + ic_launcher_round.xml")


if __name__ == "__main__":
    main()
