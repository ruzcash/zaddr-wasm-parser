use assert_matches::assert_matches;
use serde_wasm_bindgen::from_value;
use wasm_bindgen::JsValue;
use wasm_bindgen_test::*;

use zaddr_wasm_parser::{
    get_address_receivers, get_zcash_address_type, is_valid_zcash_address, normalize_zcash_address,
    AddressReceivers, 
};

mod tex_generator;

wasm_bindgen_test_configure!(run_in_browser);

// === Transparent Addresses ===

#[wasm_bindgen_test]
fn test_transparent_address() {
    let address = "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35";
    assert_eq!(normalize_zcash_address(address), Ok(address.to_string()));
}

#[wasm_bindgen_test]
fn test_transparent_type() {
    let address = "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35";
    assert_eq!(get_zcash_address_type(address), Ok("p2pkh".to_string()));
}

// === Sapling Addresses ===

#[wasm_bindgen_test]
fn test_sapling_address() {
    let address = "zs1jap4fpzz4wj0uh7zavxsju6xrqud6gdkelx4gng8h0t30qv5huz6ar4hpvsxr6tdvza9zasweve";
    assert_eq!(normalize_zcash_address(address), Ok(address.to_string()));
}

#[wasm_bindgen_test]
fn test_sapling_type() {
    let address = "zs1jap4fpzz4wj0uh7zavxsju6xrqud6gdkelx4gng8h0t30qv5huz6ar4hpvsxr6tdvza9zasweve";
    assert_eq!(get_zcash_address_type(address), Ok("sapling".to_string()));
}

// === Unified Addresses ===

#[wasm_bindgen_test]
fn test_unified_address() {
    let address = "u1qgqtyww4xfuq5u4dudpgcp4twvdtdx70lwvmz9gjjlet57n7nc76megvdz4pqn56gn5afm30yqmf2xw7qadwl8swxaev8c26557cyk9x";
    assert_eq!(normalize_zcash_address(address), Ok(address.to_string()));
}

#[wasm_bindgen_test]
fn test_unified_type() {
    let address = "u1qgqtyww4xfuq5u4dudpgcp4twvdtdx70lwvmz9gjjlet57n7nc76megvdz4pqn56gn5afm30yqmf2xw7qadwl8swxaev8c26557cyk9x";
    assert_eq!(get_zcash_address_type(address), Ok("unified".to_string()));
}

// === TEX Address ===

#[wasm_bindgen_test]
fn test_tex_address_type() {
    let address = tex_generator::generate_tex_address();
    web_sys::console::log_1(&format!("TEX address: {}", address).into());
    assert_eq!(get_zcash_address_type(&address), Ok("tex".to_string()));
}


// === Invalid Addresses ===

#[wasm_bindgen_test]
fn test_invalid_address() {
    let address = "t1XUKmDLFcRDxvf9A7tawmgePD(Invalid)";
    assert_matches!(normalize_zcash_address(address), Err(_));
}

#[wasm_bindgen_test]
fn test_invalid_zcash_address() {
    let invalid_address = "invalid_address";
    assert_eq!(is_valid_zcash_address(invalid_address), false);
}

#[wasm_bindgen_test]
fn test_invalid_format() {
    let invalid_address = "t1Zskf9m4PbJX9E8A7HHbq6sVKZdpFwLZ#";
    assert_matches!(normalize_zcash_address(invalid_address), Err(_));
}

#[wasm_bindgen_test]
fn test_empty_address() {
    let empty_address = "";
    assert_matches!(normalize_zcash_address(empty_address), Err(_));
}

// === Unified Address Receivers ===

#[wasm_bindgen_test]
fn test_get_ua_receivers_valid() {
    let address = "u1mq04mn6p50lvt0p4wdslweg8tffm3d0vn6tnyz4ry7dgrh35tw2ykzf7luh77qgsgl8wcl0a2fylvk3en5csd9nrhwdzvf8tdey9vfmuk98vj6de8msslwrh4rs06q8upcnsj5pqzq7vcestnlr08gjycj72z0pdpg02y2c2a2mcutardqpflq4p00udr7tktmyp99crfcfg6e2s30d";
    let result = get_address_receivers(address).unwrap();

    assert_ne!(result, JsValue::NULL);

    let receivers: AddressReceivers = from_value(result).unwrap();

    assert_eq!(
        receivers.orchard(),
        Some("u1qgqtyww4xfuq5u4dudpgcp4twvdtdx70lwvmz9gjjlet57n7nc76megvdz4pqn56gn5afm30yqmf2xw7qadwl8swxaev8c26557cyk9x")
    );
    assert_eq!(
        receivers.sapling(),
        Some("zs1jap4fpzz4wj0uh7zavxsju6xrqud6gdkelx4gng8h0t30qv5huz6ar4hpvsxr6tdvza9zasweve")
    );
    assert_eq!(
        receivers.p2pkh(),
        Some("t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35")
    );
}

#[wasm_bindgen_test]
fn test_get_ua_receivers_invalid() {
    let address = "invalid_address";
    let result = get_address_receivers(address);
    assert_matches!(result, Err(_));
}

#[wasm_bindgen_test]
fn test_get_ua_receivers_empty() {
    let address = "";
    let result = get_address_receivers(address);
    assert_matches!(result, Err(_));
}

#[wasm_bindgen_test]
fn test_get_p2pkh_receivers_valid() {
    let address = "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35";
    let result = get_address_receivers(address).unwrap();

    assert_ne!(result, JsValue::NULL);

    let receivers: AddressReceivers = from_value(result).unwrap();

    assert_eq!(
        receivers.p2pkh(),
        Some("t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35")
    );
}

#[wasm_bindgen_test]
fn test_get_tex_receivers_valid() {
    let address = tex_generator::generate_tex_address();
    let result = get_address_receivers(&address).unwrap();

    assert_ne!(result, JsValue::NULL);

    let receivers: AddressReceivers = from_value(result).unwrap();

    assert!(receivers.p2pkh().is_some());
}
