#!/usr/bin/env python3
"""
parser.py -- Parse Android device tree metadata
Extracts: device specs, partition layout, build props, configs
Usage: python3 parser.py BoardConfig.mk
"""
import sys, re
from pathlib import Path

def parse_boardconfig(path):
    """Parse Android BoardConfig.mk"""
    content = Path(path).read_text()
    result = {}

    # Architecture
    arch_m = re.search(r'TARGET_ARCH\s*:=\s*(\w+)', content)
    if arch_m:
        result['arch'] = arch_m.group(1)

    # CPU variant
    cpu_m = re.search(r'TARGET_CPU_VARIANT\s*:=\s*(\S+)', content)
    if cpu_m:
        result['cpu'] = cpu_m.group(1)

    # Kernel
    kernel_m = re.search(r'TARGET_PREBUILT_KERNEL\s*:=\s*(\S+)', content)
    if kernel_m:
        result['kernel'] = kernel_m.group(1)

    # Partitions
    result['partitions'] = {}
    for line in content.splitlines():
        if 'BOARD_' in line and 'PARTITION' in line:
            key_m = re.search(r'(BOARD_\w+PARTITION\w+)\s*:=\s*(\S+)', line)
            if key_m:
                result['partitions'][key_m.group(1)] = key_m.group(2)

    # Recovery
    recovery_m = re.search(r'TARGET_RECOVERY_PIXEL_FORMAT\s*:=\s*(\w+)', content)
    if recovery_m:
        result['recovery_format'] = recovery_m.group(1)

    return result

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 parser.py <BoardConfig.mk>")
        sys.exit(1)

    result = parse_boardconfig(sys.argv[1])
    print("\n📖 Device Tree Metadata\n")
    for k, v in result.items():
        if isinstance(v, dict):
            print(f"{k}:")
            for sk, sv in v.items():
                print(f"  {sk:<40} {sv}")
        else:
            print(f"{k:<40} {v}")

if __name__ == "__main__":
    main()
