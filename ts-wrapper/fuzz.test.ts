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
    { input: "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35", label: "valid t-addr" },
    { input: "u1invalid", label: "invalid UA" },
    { input: "<script>alert(1)</script>", label: "xss attempt" },
    { input: "u1" + "a".repeat(300), label: "too long" },
    { input: "z".repeat(5000), label: "too long" },
  ];

  for (const { input, label } of cases) {
    it(`isZcashAddressValid – ${label}`, () => {
      expect(() => sdk.isZcashAddressValid(input)).not.toThrow();
    });

    it(`getZcashAddressType – ${label}`, () => {
      expect(() => sdk.getZcashAddressType(input)).not.toThrow();
    });

    it(`normalizeZcashAddress – ${label}`, () => {
      expect(() => sdk.normalizeZcashAddress(input)).not.toThrow();
    });

    it(`getAddressReceivers – ${label}`, () => {
      expect(() => sdk.getAddressReceivers(input)).not.toThrow();
    });
  }
});
