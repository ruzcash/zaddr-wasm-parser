# zaddr-wasm-parser

`zaddr-wasm-parser` is a lightweight, stateless address parser for Zcash, compiled to WebAssembly (WASM) for safe integration into front-end applications.

It provides a minimal and reliable API to validate, classify, and analyze Zcash addresses, including Unified Addresses (UA), without requiring access to private keys, wallet state, or blockchain nodes.

This module is built using the Rust library [`zcash_address`](https://docs.rs/zcash_address/latest/zcash_address).  
Source code is located in the `src/` directory.  
WASM-integrated tests are located in the `tests/` directory.

---

## Installation and Build

To compile the WASM module for use in the browser:

```bash
wasm-pack build --target web
```

The output will be placed in the `pkg/` directory. You can import this module directly in TypeScript using the `ts-wrapper/` bindings.

---

## Usage Example

```ts
import {
  initWasm,
  isZcashAddressValid,
  getZcashAddressType,
  getRawZcashAddress,
  getUnifiedAddressReceivers,
} from "zaddr-wasm-parser";

await initWasm();

const addr = "u1...";
console.log("Valid:", isZcashAddressValid(addr));
console.log("Type:", getZcashAddressType(addr));
console.log("Raw:", getRawZcashAddress(addr));
console.log("Receivers:", getUnifiedAddressReceivers(addr));
```

---

## API Reference

### `initWasm(): Promise<void>`
Initializes the WebAssembly module. Must be called before using other functions.

### `isZcashAddressValid(address: string): boolean`
Returns `true` if the given string is a valid Zcash address.

### `getZcashAddressType(address: string): "t" | "z" | "u" | "tex" | "unknown"`
Returns the address type:
- `"t"` — Transparent address
- `"z"` — Sapling shielded address
- `"u"` — Unified address
- `"tex"` — TExt address (experimental)
- `"unknown"` — Invalid address

### `getRawZcashAddress(address: string): string | null`
Returns a normalized version of the address string, or `null` if the input is invalid.

### `getUnifiedAddressReceivers(address: string): string[]`
If a Unified Address is provided, this returns a list of its internal receivers as address strings.

---

## Testing

To run tests using Chrome:

### 1. Install wasm-bindgen test tools:

```bash
cargo install wasm-bindgen-cli
```

### 2. Run tests in browser:

```bash
wasm-pack test --chrome
```

This will launch Chrome and run the test suite defined in `tests/`.

---

## Browser Demo

A functional test page is included in the repository:  
`zcash_address_parser_test.html`

To run it:

```bash
npx live-server
```

The page demonstrates address parsing and classification in the browser using the compiled WASM module.

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
│   ├── package.json
│   ├── tsconfig.json
│   └── demo.ts
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

[@ruzcash](https://github.com/ruzcash)
