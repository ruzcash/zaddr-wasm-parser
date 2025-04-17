import { initWasm, isZcashAddressValid, getZcashAddressType, normalizeZcashAddress, getAddressReceivers } from "./src/__mocks__/index";

await initWasm();

const addresses = [
  { label: "Empty", addr: "" },
  { label: "Emoji 💩", addr: "💩💩💩" },
  { label: "Garbage", addr: "foobar1234567890notreal" },
  { label: "t1 (P2PKH)", addr: "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35" },
  { label: "z (Sapling)", addr: "zs1jap4fpzz4wj0uh7zavxsju6xrqud6gdkelx4gng8h0t30qv5huz6ar4hpvsxr6tdvza9zasweve" },
  { label: "u (Unified)", addr: "u1mq04mn6p50lvt0p4wdslweg8tffm3d0vn6tnyz4ry7dgrh35tw2ykzf7luh77qgsgl8wcl0a2fylvk3en5csd9nrhwdzvf8tdey9vfmuk98vj6de8msslwrh4rs06q8upcnsj5pqzq7vcestnlr08gjycj72z0pdpg02y2c2a2mcutardqpflq4p00udr7tktmyp99crfcfg6e2s30d" },
  { label: "tex (TEX)", addr: "tex1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3xvlx7" },
];

for (const { label, addr } of addresses) {
  console.log(`\n--- ${label} ---`);
  try {
    console.log("Address:", addr);
    const valid = isZcashAddressValid(addr);
    console.log("isZcashAddressValid:", valid);
    if (!valid) continue;

    const typ = getZcashAddressType(addr);
    console.log("getZcashAddressType:", typ);

    const norm = normalizeZcashAddress(addr);
    console.log("normalizeZcashAddress:", norm);

    const receivers = getAddressReceivers(addr);
    console.log("getAddressReceivers:", receivers);
  } catch (e: any) {
    console.error("💥 Error:", e.message || e);
  }
}
