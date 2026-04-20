#!/usr/bin/env python3
"""
parse_rom.py -- Extract and parse ROM metadata from ZIP files
Usage: python3 parse_rom.py rom.zip
"""
import zipfile, json, sys

if len(sys.argv) < 2:
    print("Usage: python3 parse_rom.py <rom.zip>")
    sys.exit(1)

try:
    with zipfile.ZipFile(sys.argv[1], 'r') as z:
        metadata = {}
        for name in z.namelist():
            if "metadata" in name.lower() or "build.prop" in name:
                content = z.read(name).decode("utf-8", errors="ignore")
                print(f"Found: {name}")
                print(content[:200])
except Exception as e:
    print(f"Error: {e}")
