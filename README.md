# zaddr-wasm-parser

`zaddr-wasm-parser` is a lightweight, stateless address parser for Zcash, compiled to WebAssembly (WASM) for safe integration into front-end applications.

It provides a minimal and reliable API to validate, classify, and analyze Zcash addresses, including Unified Addresses (UA), without requiring access to private keys, wallet state, or blockchain nodes.

This module is built using the Rust library [`zcash_address`](https://docs.rs/zcash_address/latest/zcash_address).  
Source code is located in the `src/` directory.  
WASM-integrated tests are located in the `tests/` directory.

---

## Installation and Build

To set up the project from a clean system:

### 1. Clone the repository:

```bash
cd ~/zcash-wasm
git clone https://github.com/ruzcash/zaddr-wasm-parser.git
cd zaddr-wasm-parser
```

### 2. Install dependencies:

Install the Rust WebAssembly toolchain:

```bash
brew install wasm-pack
```

(Optional) Install `wasm-bindgen-cli` to run browser tests:

```bash
cargo install wasm-bindgen-cli
```

(Optional) Install a simple local server for browser preview:

```bash
npm install -g live-server
```

### 3. Build the WASM module:

#### For Node.js (TypeScript tests and demo)
```bash
wasm-pack build --target bundler --out-dir pkg
```

#### For browser (HTML demo and tests)
```bash
wasm-pack build --target web --out-dir pkg
```

> ⚠️ These two targets are **not compatible** with each other. If you switch between browser and Node.js testing, recompile the WASM module accordingly.

---

## TypeScript Wrapper

### Compile and run demo

```bash
cd ts-wrapper
npm install
npm run build
npm run demo-dev   # Runs src/demo.ts with a mocked SDK
npm run demo       # Runs compiled dist/demo.js with real WASM
```

> `demo.ts` dynamically switches between `src/` and `dist/` depending on the `USE_SRC` environment variable.

---

## `npm` Usage

This package is published to `npm` under a forked repository: https://github.com/elemental-zcash/zaddr-wasm-parser with the package name `@elemental-zcash/zaddr_wasm_parser`.

```tsx
import initWasm, {
  normalize_zcash_address,
  is_valid_zcash_address,
  get_zcash_address_type,
  get_address_receivers
} from "@elemental-zcash/zaddr_wasm_parser";

await initWasm();

const addr = "u1...";

console.log("Valid:", isZcashAddressValid(addr));
console.log("Type:", getZcashAddressType(addr));
console.log("Normalized:", normalizeZcashAddress(addr));
console.log("Receivers:", getAddressReceivers(addr));
```

Returned receiver structure:

```type AddressReceivers = {
  p2pkh: string | null;
  p2sh: string | null;
  sapling: string | null;
  orchard: string | null;
  tex: string | null;
};
```


## Usage Example

```ts
import {
  initWasm,
  isZcashAddressValid,
  getZcashAddressType,
  normalizeZcashAddress,
  getAddressReceivers,
} from "zaddr-wasm-parser";


await initWasm();

const addr = "u1...";
console.log("Valid:", isZcashAddressValid(addr));
console.log("Type:", getZcashAddressType(addr));
console.log("Normalized:", normalizeZcashAddress(addr));
console.log("Receivers:", getAddressReceivers(addr));
```

---

## API Reference

### `initWasm(): Promise<void>`
Initializes the WebAssembly module. Must be called before using other functions.

### `isZcashAddressValid(address: string): boolean`
Returns `true` if the given string is a valid Zcash address.

### `getZcashAddressType(address: string): "p2pkh" | "p2sh" | "sapling" | "unified" | "tex"`
Returns the address type:
- `"p2pkh"` — Transparent Pay-to-PubKey-Hash address
- `"p2sh"` — Transparent Pay-to-Script-Hash address
- `"sapling"` — Sapling shielded address
- `"unified"` — Unified address
- `"tex"` — TExt address (experimental)

### `normalizeZcashAddress(address: string): string`
Returns a normalized version of the address string.
Throws a `JsError` if the input is invalid.

### `getAddressReceivers(address: string): AddressReceivers`
Decomposes a Zcash address into its internal receivers.  
Throws a `JsError` if the input is invalid.

```ts
type AddressReceivers = {
  p2pkh: string | null;
  p2sh: string | null;
  sapling: string | null;
  orchard: string | null;
  tex: string | null;
};
```

---

## Fuzz Testing (Vitest)

A comprehensive fuzz test is included to ensure the Zcash address parser handles edge cases correctly and safely.

This uses [`vitest`](https://vitest.dev/) to validate the parser’s behavior across malformed, truncated, and fully valid addresses. It covers:

- Address validation
- Type detection
- Normalization
- Receiver extraction

Supported address types include:
- Transparent (`p2pkh`, `p2sh`)
- Sapling
- Unified Address (UA)
- Orchard-only UA
- TEX

All tests are located in:  
`ts-wrapper/fuzz.test.ts`

Run it from the `ts-wrapper` directory:

```bash
cd ts-wrapper
npm run fuzz
```

---

## Rust Testing 

To run integration tests using Chrome:

```bash
wasm-pack test --chrome
```

All WASM-enabled Rust tests are located in the `tests/` directory.  
They cover transparent, shielded, Unified, and invalid Zcash address formats.

> If you see errors related to `WebAssembly.instantiateStreaming`, make sure the module was built with `--target web`:

```bash
wasm-pack build --target web --out-dir pkg
```

Expected output:

```
test result: ok. 16 passed; 0 failed
```

---

### Node.js Integration Tests

A plain JavaScript test file is included for manual validation via Node.js:

```bash
npx tsx test-integration/test.js
```

This script verifies multiple Zcash address types, including:

- `t1` — Transparent P2PKH  
- `zs` — Sapling  
- `u1` — Unified Address  
- `tex1` — TEX address (wrapped P2PKH with a different prefix)

It also covers malformed inputs (e.g. empty strings, emojis, and garbage).

Each test case prints results from the following methods:

- `is_valid_zcash_address`
- `get_zcash_address_type`
- `normalize_zcash_address`
- `get_address_receivers`

This is a quick way to confirm that the WASM module functions correctly in Node.js environments.

---


## Browser Demo

A functional browser-based demo page is included in the repository:  
`zcash_address_parser_test.html`

To view the demo locally:

```bash
npx live-server
```

Then open the following URL:

```
http://127.0.0.1:8080/zcash_address_parser_test.html
```

This HTML page allows interactive testing of Zcash address parsing and classification using the compiled WASM module.

> Ensure the WASM module was compiled using `--target web` before using the browser demo.

---

## Why Use This?

`zaddr-wasm-parser` is designed for use cases where full-node access is not practical — especially:

- Browser-based applications
- Exchanges migrating from transparent to Unified Addresses
- Zcash-compatible tooling that needs quick validation

This library never touches private keys or network state. It's ideal for front-end environments, static analysis, or integration in Web SDKs.

---

## Project Structure

```
zaddr-wasm-parser/
├── src/                        # Rust source code (lib.rs)
├── tests/                      # Rust-based tests for WASM
├── ts-wrapper/                # TypeScript interface and bindings
│   ├── src/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── dist/
│   ├── demo.ts
│   ├── fuzz.test.ts
│   ├── package.json
│   └── __mocks__/
├── test-integration/          # Optional JS-only local test
│   └── test.js
├── zcash_address_parser_test.html  # Browser test page
├── Cargo.toml
├── README.md
├── .gitignore
├── LICENSE-MIT
├── LICENSE-APACHE
```

---

## License

Dual-licensed under MIT or Apache-2.0.

---

## Maintainer

- [@elemental-zcash](https://github.com/elemental-zcash)
- [@nuttycom](https://github.com/nuttycom)
- [@ruzcash](https://github.com/ruzcash)  


