export async function initWasm() {
  console.log("⚠️ [Mock] initWasm called");
}

export function isZcashAddressValid(address: string): boolean {
  return typeof address === "string" && address.startsWith("t1");
}

export function getZcashAddressType(address: string): string {
  if (address.startsWith("t1")) return "transparent";
  if (address.startsWith("zs")) return "sapling";
  if (address.startsWith("u1")) return "unified";
  return "unknown";
}

export function parseZcashAddress(_: string): boolean {
  return true;
}

export function getRawZcashAddress(_: string): string | null {
  return "rawaddress";
}

export function getUnifiedAddressReceivers(_: string): string[] {
  return ["sapling", "transparent"];
}
