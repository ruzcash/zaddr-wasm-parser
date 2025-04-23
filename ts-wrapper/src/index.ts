import * as bindings from "../../pkg";


type AddressReceivers = {
  p2pkh: string | null;
  p2sh: string | null;
  sapling: string | null;
  orchard: string | null;
};

export function isZcashAddressValid(address: string): boolean {
  return bindings.is_valid_zcash_address(address);
}

export function getZcashAddressType(address: string): string {
  return bindings.get_zcash_address_type(address);
}

export function normalizeZcashAddress(address: string): string {
  return bindings.normalize_zcash_address(address);
}

export function getAddressReceivers(address: string): AddressReceivers {
  return bindings.get_address_receivers(address);
}
