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
  ];

  for (const { input, label } of cases) {
    it(`should not throw for case: ${label}`, () => {
      expect(() => sdk.getZcashAddressType(input)).not.toThrow();
    });
  }
});
