use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;

extern crate alloc;
use alloc::vec::Vec;

use zcash_protocol::consensus::NetworkType;

use zcash_address::{
    ZcashAddress,
    ConversionError,
    TryFromRawAddress,
    ToAddress,
    unified::{Address as UnifiedAddress, Container, Receiver, Encoding},
};

// Function to validate Zcash address (removes HTML tags)
fn validate_address(addr_string: &str) -> Option<String> {
    let clean_addr = addr_string.replace("<", "").replace(">", "");
    match ZcashAddress::try_from_encoded(&clean_addr) {
        Ok(_) => Some(clean_addr),
        Err(_) => None,
    }
}

// Returns a normalized address string
#[wasm_bindgen]
pub fn get_raw_zcash_address_js(addr_string: &str) -> String {
    if !is_valid_zcash_address(addr_string) {
        return "Error: Invalid address format".to_string();
    }
    match ZcashAddress::try_from_encoded(addr_string) {
        Ok(addr) => addr.encode(),
        Err(_) => "Error: Invalid address format".to_string(),
    }
}

// Checks if the address is valid
#[wasm_bindgen]
pub fn parse_zcash_address_js(addr_string: &str) -> bool {
    validate_address(addr_string).is_some() 
}

#[wasm_bindgen]
pub fn is_valid_zcash_address(addr_string: &str) -> bool {
    validate_address(addr_string).is_some()
}

// Returns address type prefix: "t", "z", "u", or "tex"
#[wasm_bindgen]
pub fn get_zcash_address_type(addr_string: &str) -> String {
    match validate_address(addr_string) {
        Some(addr) => match ZcashAddress::try_from_encoded(&addr) {
            Ok(addr) => match addr.convert_if_network::<AddressType>(NetworkType::Main) {
                Ok(AddressType(prefix)) => prefix.to_string(),
                Err(_) => "Error: Invalid address format".to_string(),
            },
            Err(_) => "Error: Invalid address format".to_string(),
        },
        None => "Error: Invalid address format".to_string(),
    }
}

pub struct AddressType(&'static str);

impl TryFromRawAddress for AddressType {
    type Error = &'static str;

    fn try_from_raw_sapling(_: [u8; 43]) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("z"))
    }

    fn try_from_raw_transparent_p2pkh(_: [u8; 20]) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("t"))
    }

    fn try_from_raw_transparent_p2sh(_: [u8; 20]) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("t"))
    }

    fn try_from_raw_unified(_: UnifiedAddress) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("u"))
    }

    fn try_from_raw_tex(_: [u8; 20]) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("tex"))
    }
}

// Returns a list of receivers from a Unified Address
#[wasm_bindgen]
pub fn get_ua_receivers(addr_string: &str) -> JsValue {
    match validate_address(addr_string) {
        Some(addr) => {
            let Ok(addr) = addr.parse::<ZcashAddress>() else {
                return JsValue::NULL;
            };

            struct MyUnified(UnifiedAddress);

            impl TryFromRawAddress for MyUnified {
                type Error = &'static str;

                fn try_from_raw_unified(data: UnifiedAddress) -> Result<Self, ConversionError<Self::Error>> {
                    Ok(MyUnified(data))
                }
            }

            let Ok(MyUnified(ua)) = addr.convert_if_network::<MyUnified>(NetworkType::Main) else {
                return JsValue::NULL;
            };

            let result: Vec<String> = ua.items().into_iter().map(|receiver| {
                match receiver {
                    Receiver::Sapling(d) => ZcashAddress::from_sapling(NetworkType::Main, d).encode(),
                    Receiver::P2pkh(d) => ZcashAddress::from_transparent_p2pkh(NetworkType::Main, d).encode(),
                    Receiver::P2sh(d) => ZcashAddress::from_transparent_p2sh(NetworkType::Main, d).encode(),
                    Receiver::Orchard(d) => {
                        UnifiedAddress::try_from_items(vec![Receiver::Orchard(d)])
                            .ok()
                            .map(|ua| ZcashAddress::from_unified(NetworkType::Main, ua).encode())
                            .unwrap_or_default()
                    }
                    Receiver::Unknown { typecode, .. } => format!("Unknown receiver typecode: {typecode}"),
                }
            }).collect();

            to_value(&result).unwrap_or(JsValue::NULL)
        },
        None => JsValue::NULL,  // Если адрес невалидный
    }
}
