import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

let wasm: {
  is_valid_zcash_address: (addr: string) => boolean;
  get_zcash_address_type: (addr: string) => string;
  parse_zcash_address_js: (addr: string) => boolean;
  get_raw_zcash_address_js: (addr: string) => string;
  get_ua_receivers: (addr: string) => string[];
};

export async function initWasm(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const wasmModulePath = path.resolve(__dirname, "../../pkg/zaddr_wasm_parser.js");

  const wasmModule = await import(pathToFileURL(wasmModulePath).href);
  wasm = wasmModule;
}

export function isZcashAddressValid(address: string): boolean {
  return wasm.is_valid_zcash_address(address);
}

export function getZcashAddressType(address: string): string {
  return wasm.get_zcash_address_type(address);
}

export function parseZcashAddress(address: string): boolean {
  return wasm.parse_zcash_address_js(address);
}

export function getRawZcashAddress(address: string): string | null {
  const result = wasm.get_raw_zcash_address_js(address);
  return result.startsWith("Error") ? null : result;
}

export function getUnifiedAddressReceivers(address: string): string[] {
  const val = wasm.get_ua_receivers(address);
  return val ? Array.from(val) : [];
}
