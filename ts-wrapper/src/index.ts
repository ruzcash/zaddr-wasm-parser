import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

type AddressReceivers = {
    p2pkh: string | null,
    p2sh: string | null,
    sapling: string | null,
    orchard: string | null
};

let wasm: {
  is_valid_zcash_address: (addr: string) => boolean;
  get_zcash_address_type: (addr: string) => string;
  normalize_zcash_address: (addr: string) => string;
  get_address_receivers: (addr: string) => AddressReceivers;
};

export async function initWasm(): Promise<void> {
  if (wasm) return;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const wasmModulePath = path.resolve(__dirname, "../../pkg/zaddr_wasm_parser.js");

  wasm = await import(pathToFileURL(wasmModulePath).href);
}

export function isZcashAddressValid(address: string): boolean {
  return wasm.is_valid_zcash_address(address);
}

export function getZcashAddressType(address: string): string {
  return wasm.get_zcash_address_type(address);
}

export function normalizeZcashAddress(address: string): string {
  return wasm.normalize_zcash_address(address);
}

export function getAddressReceivers(address: string): AddressReceivers {
  return wasm.get_address_receivers(address);
}
