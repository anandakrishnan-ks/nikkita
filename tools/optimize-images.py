#!/usr/bin/env python3
"""Build responsive WebP derivatives from retained originals; requires Pillow.

Run after replacing a source photo, then run tools/update-seo.py. Outputs are
deterministic for the installed Pillow version; originals are never overwritten.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    from PIL import Image, ImageOps
    config = json.loads((ROOT / "tools/seo-config.json").read_text())
    total = 0
    for source, settings in config["image_derivatives"].items():
        path = ROOT / source
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original)
            for width in settings["widths"]:
                if width > image.width:
                    raise ValueError(f"Do not upscale {source} to {width}px")
                height = round(image.height * width / image.width)
                target = path.with_name(f"{path.stem}-{width}.webp")
                image.resize((width, height), Image.Resampling.LANCZOS).save(
                    target, format="WEBP", quality=94 if "/brand/" in source else 88, method=6,
                    icc_profile=original.info.get("icc_profile", b""),
                )
                total += 1
    print(f"Generated {total} responsive WebP derivatives; retained all source files.")


if __name__ == "__main__":
    main()
