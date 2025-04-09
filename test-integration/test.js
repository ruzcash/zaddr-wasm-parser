import { initWasm, getZcashAddressType } from "zaddr-wasm-parser";

(async () => {
  await initWasm();
  const type = getZcashAddressType("zs1jap4fpzz4wj0uh7zavxsju6xrqud6gdkelx4gng8h0t30qv5huz6ar4hpvsxr6tdvza9zasweve");
  console.log("Type:", type); // Output "z"
})();

