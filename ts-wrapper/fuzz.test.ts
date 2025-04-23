import { describe, it, expect, beforeAll } from "vitest";
import * as sdk from "./src/__mocks__/index";

beforeAll(async () => {
  await sdk.initWasm();
});

describe("Fuzzing getZcashAddressType", () => {
  const cases = [
    { input: "", label: "empty" },
    { input: "💀💣", label: "emoji" },
    { input: "t1abc...", label: "too short" },
    { input: "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35", label: "valid T-addr" },
    { input: "zs1jap4fpzz4wj0uh7zavxsju6xrqud6gdkelx4gng8h0t30qv5huz6ar4hpvsxr6tdvza9zasweve", label: "valid Sapling" },
    { input: "u1mq04mn6p50lvt0p4wdslweg8tffm3d0vn6tnyz4ry7dgrh35tw2ykzf7luh77qgsgl8wcl0a2fylvk3en5csd9nrhwdzvf8tdey9vfmuk98vj6de8msslwrh4rs06q8upcnsj5pqzq7vcestnlr08gjycj72z0pdpg02y2c2a2mcutardqpflq4p00udr7tktmyp99crfcfg6e2s30d", label: "valid UA" },
    { input: "u1qgqtyww4xfuq5u4dudpgcp4twvdtdx70lwvmz9gjjlet57n7nc76megvdz4pqn56gn5afm30yqmf2xw7qadwl8swxaev8c26557cyk9x", label: "valid Orchard" },
    { input: "tex1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3xvlx7", label: "valid TEX" },
    { input: "u2qgqtyww4xfuq5u4dudpgcp4twvdtdx70lwvmz9gjjlet57n7nc76megvdz4pqn56gn5afm30yqmf2xw7qadwl8swxaev8c26557cyk9x", label: "invalid address" },
    { input: "<script>alert(1)</script>", label: "xss attempt" },
    { input: "u1" + "a".repeat(300), label: "too long" },
  ];

  for (const { input, label } of cases) {
    it(`isZcashAddressValid – ${label}`, () => {
      expect(() => sdk.isZcashAddressValid(input)).not.toThrow();
      const valid = sdk.isZcashAddressValid(input);
      console.log(`isValid[${label}] →`, valid);
      if (label.startsWith("valid")) {
        expect(valid).toBe(true);
      }
    });

    it(`getZcashAddressType – ${label}`, () => {
      expect(() => sdk.getZcashAddressType(input)).not.toThrow();
      const type = sdk.getZcashAddressType(input);
      console.log(`type[${label}] →`, type);
      expect(typeof type).toBe("string");

      if (label === "valid T-addr") {
        expect(type).toBe("p2pkh");
      } else if (label === "valid Sapling") {
        expect(type).toBe("sapling");
      } else if (label === "valid UA" || label === "valid Orchard") {
        expect(type).toBe("unified");
      } else if (label === "valid TEX") {
        expect(type).toBe("tex");
      } else if (label.startsWith("valid")) {
        expect(type).toMatch(/^(sapling|unified|orchard|p2pkh|p2sh|tex)$/);
      }
    });

    it(`normalizeZcashAddress – ${label}`, () => {
      expect(() => sdk.normalizeZcashAddress(input)).not.toThrow();
      const normalized = sdk.normalizeZcashAddress(input);
      console.log(`normalized[${label}] →`, normalized);
      if (label.startsWith("valid")) {
        expect(typeof normalized).toBe("string");
        expect(normalized.length).toBeGreaterThan(10);
      }
    });

    it(`getAddressReceivers – ${label}`, () => {
      expect(() => sdk.getAddressReceivers(input)).not.toThrow();
      const receivers = sdk.getAddressReceivers(input);
      console.log(`receivers[${label}] →`, receivers);
      if (label.startsWith("valid")) {
        expect(receivers).toBeTypeOf("object");

        if (label === "valid T-addr") {
          expect(receivers.p2pkh || receivers.p2sh).toBeTruthy();
        }

        if (label === "valid Sapling") {
          expect(receivers.sapling).toBeTruthy();
        }

        if (label === "valid UA") {
          expect(
            receivers.sapling || receivers.p2pkh || receivers.p2sh || receivers.orchard
          ).toBeTruthy();
        }

        if (label === "valid Orchard") {
          expect(receivers.orchard).toBeTruthy();
          expect(receivers.sapling || receivers.p2pkh || receivers.p2sh).toBeFalsy();
        }

        if (label === "valid TEX") {
          expect(receivers.p2pkh).toBeTruthy();
        }
      }
    });
  }
});
