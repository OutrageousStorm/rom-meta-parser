#!/usr/bin/env node
/**
 * rom-meta-parser.js - Parse Android device tree metadata
 * Extracts ROM info from build.prop, device tree, fingerprint
 * Usage: ./parser.js --device pixel6 --prop ro.build.fingerprint
 */

const fs = require('fs');
const readline = require('readline');

// Common Android properties
const PROPS = {
  'ro.product.model': 'Device Model',
  'ro.build.version.release': 'Android Version',
  'ro.build.version.sdk': 'API Level',
  'ro.product.cpu.abi': 'CPU ABI',
  'ro.build.fingerprint': 'Build Fingerprint',
  'ro.build.id': 'Build ID',
  'ro.build.version.security_patch': 'Security Patch',
  'ro.bootloader': 'Bootloader',
  'ro.serialno': 'Serial Number',
  'ro.hardware': 'Hardware',
};

async function parseBuildProp(filepath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Infinity
  });

  const props = {};
  for await (const line of rl) {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      props[match[1]] = match[2];
    }
  }
  return props;
}

function parseFingerprint(fingerprint) {
  // Format: brand/device/device:version/build_id/release/type/tags
  const parts = fingerprint.split('/');
  return {
    brand: parts[0],
    device: parts[1],
    codename: parts[2],
    version: parts[3],
    build_id: parts[4],
    release: parts[5],
    type: parts[6],
    tags: parts[7],
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
rom-meta-parser - Parse Android device metadata

Usage:
  ./parser.js --file build.prop                  Parse build.prop file
  ./parser.js --fingerprint <fingerprint>       Parse fingerprint string
  ./parser.js --list                            List all properties

Examples:
  ./parser.js --file system/build.prop
  ./parser.js --fingerprint "google/oriole/oriole:13/TP1A.220624.014/8816326:user/release-keys"
    `);
    process.exit(0);
  }

  if (args.includes('--list')) {
    console.log('Known Android properties:\n');
    for (const [key, desc] of Object.entries(PROPS)) {
      console.log(`  ${key.padEnd(40)} ${desc}`);
    }
    return;
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1) {
    const filepath = args[fileIdx + 1];
    try {
      const props = await parseBuildProp(filepath);
      console.log(`Parsed ${Object.keys(props).length} properties from ${filepath}\n`);
      for (const [key, val] of Object.entries(props).slice(0, 20)) {
        const desc = PROPS[key] || '';
        console.log(`  ${key.padEnd(45)} = ${val}`);
      }
      if (Object.keys(props).length > 20) {
        console.log(`  ... and ${Object.keys(props).length - 20} more`);
      }
    } catch (e) {
      console.error(`Error reading file: ${e.message}`);
      process.exit(1);
    }
    return;
  }

  const fpIdx = args.indexOf('--fingerprint');
  if (fpIdx !== -1) {
    const fp = args[fpIdx + 1];
    const parsed = parseFingerprint(fp);
    console.log(`Fingerprint: ${fp}\n`);
    for (const [key, val] of Object.entries(parsed)) {
      console.log(`  ${key.padEnd(15)} ${val}`);
    }
    return;
  }

  console.log('Usage: ./parser.js --file build.prop');
  console.log('       ./parser.js --fingerprint <fingerprint>');
  console.log('       ./parser.js --help');
}

main().catch(console.error);
