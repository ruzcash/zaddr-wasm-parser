export async function initWasm() {
  console.log("⚠️ [Mock] initWasm called");
}

export function isZcashAddressValid(address: string): boolean {
  return typeof address === "string" &&
    (address.startsWith("t1") ||
     address.startsWith("t3") ||
     address.startsWith("zs") ||
     address.startsWith("u1") ||
     address.startsWith("tex"));
}

export function getZcashAddressType(address: string): string {
  if (address.startsWith("t1")) return "p2pkh";
  if (address.startsWith("t3")) return "p2sh";
  if (address.startsWith("zs")) return "sapling";
  if (address.startsWith("u1")) return "unified";
  if (address.startsWith("tex")) return "tex";
  return "unknown";
}

export function normalizeZcashAddress(address: string): string {
  return address.trim();
}

export function getAddressReceivers(address: string): {
  p2pkh: string | null;
  p2sh: string | null;
  sapling: string | null;
  orchard: string | null;
} {
  return {
    p2pkh: address.startsWith("t1") || address.startsWith("tex") ? address : null,
    p2sh: address.startsWith("t3") ? address : null,
    sapling: address.startsWith("zs") ? address : null,
    orchard: address.startsWith("u1") ? address : null,
  };
}
