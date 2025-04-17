use regex::Regex;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

extern crate alloc;

use zcash_address::{
    unified::{Address as UnifiedAddress, Container, Encoding, Receiver},
    ConversionError, ParseError, ToAddress, TryFromAddress, ZcashAddress,
};
use zcash_protocol::consensus::NetworkType;

// Function to parse a Zcash address from a string, stripping invalid characters that
// preceed or follow the address string.
fn parse_address(addr_str: &str) -> Result<ZcashAddress, ParseError> {
    let re = Regex::new(".*?([0-9A-Za-z]{20,}).*?").expect("hardcoded regex is valid");
    let clean_str = re.find(addr_str).ok_or(ParseError::NotZcash)?;
    ZcashAddress::try_from_encoded(clean_str.as_str())
}

// Returns a normalized address string
#[wasm_bindgen]
pub fn normalize_zcash_address(addr_str: &str) -> Result<String, JsValue> {
    parse_address(addr_str).map_or_else(
        |err| Err(JsValue::from_str(&format!("{}", err))),
        |addr| Ok(addr.encode()),
    )
}

// Checks if the address is valid
#[wasm_bindgen]
pub fn is_valid_zcash_address(addr_str: &str) -> bool {
    parse_address(addr_str).is_ok()
}

// Returns address type prefix: "t", "z", "u", or "tex"
#[wasm_bindgen]
pub fn get_zcash_address_type(addr_str: &str) -> Result<String, JsValue> {
    parse_address(addr_str).map_or_else(
        |err| Err(JsValue::from_str(&format!("{}", err))),
        |addr| {
            Ok(addr
                .convert::<AddressType>()
                .expect("conversion is infallible")
                .0
                .to_string())
        },
    )
}

pub struct AddressType(&'static str);

impl TryFromAddress for AddressType {
    type Error = core::convert::Infallible;

    fn try_from_transparent_p2pkh(
        _: NetworkType,
        _: [u8; 20],
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("p2pkh"))
    }

    fn try_from_transparent_p2sh(
        _: NetworkType,
        _: [u8; 20],
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("p2sh"))
    }

    fn try_from_sapling(_: NetworkType, _: [u8; 43]) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("sapling"))
    }

    fn try_from_unified(
        _: NetworkType,
        _: zcash_address::unified::Address,
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("unified"))
    }

    fn try_from_tex(_: NetworkType, _: [u8; 20]) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressType("tex"))
    }
}

#[wasm_bindgen]
#[derive(serde::Serialize, serde::Deserialize, Default)]
pub struct AddressReceivers {
    p2pkh: Option<String>,
    p2sh: Option<String>,
    sapling: Option<String>,
    orchard: Option<String>,
}

impl AddressReceivers {
    pub fn p2pkh(&self) -> Option<&str> {
        self.p2pkh.as_ref().map(|x| x.as_str())
    }
    pub fn p2sh(&self) -> Option<&str> {
        self.p2sh.as_ref().map(|x| x.as_str())
    }
    pub fn sapling(&self) -> Option<&str> {
        self.sapling.as_ref().map(|x| x.as_str())
    }
    pub fn orchard(&self) -> Option<&str> {
        self.orchard.as_ref().map(|x| x.as_str())
    }
}

impl TryFromAddress for AddressReceivers {
    type Error = core::convert::Infallible;

    fn try_from_transparent_p2pkh(
        net: NetworkType,
        data: [u8; 20],
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressReceivers {
            p2pkh: Some(ZcashAddress::from_transparent_p2pkh(net, data).encode()),
            ..Default::default()
        })
    }

    fn try_from_transparent_p2sh(
        net: NetworkType,
        data: [u8; 20],
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressReceivers {
            p2sh: Some(ZcashAddress::from_transparent_p2sh(net, data).encode()),
            ..Default::default()
        })
    }

    fn try_from_sapling(
        net: NetworkType,
        data: [u8; 43],
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressReceivers {
            sapling: Some(ZcashAddress::from_sapling(net, data).encode()),
            ..Default::default()
        })
    }

    fn try_from_unified(
        net: NetworkType,
        ua: zcash_address::unified::Address,
    ) -> Result<Self, ConversionError<Self::Error>> {
        let mut ua_receivers = AddressReceivers {
            p2pkh: None,
            p2sh: None,
            sapling: None,
            orchard: None,
        };
        for receiver in ua.items() {
            match receiver {
                Receiver::P2pkh(d) => {
                    ua_receivers.p2pkh = Some(ZcashAddress::from_transparent_p2pkh(net, d).encode())
                }
                Receiver::P2sh(d) => {
                    ua_receivers.p2sh = Some(ZcashAddress::from_transparent_p2sh(net, d).encode())
                }
                Receiver::Sapling(d) => {
                    ua_receivers.sapling = Some(ZcashAddress::from_sapling(net, d).encode())
                }
                Receiver::Orchard(d) => {
                    ua_receivers.orchard =
                        UnifiedAddress::try_from_items(vec![Receiver::Orchard(d)])
                            .ok()
                            .map(|ua| ZcashAddress::from_unified(net, ua).encode())
                }
                Receiver::Unknown { .. } => {}
            }
        }
        Ok(ua_receivers)
    }

    fn try_from_tex(
        net: NetworkType,
        data: [u8; 20],
    ) -> Result<Self, ConversionError<Self::Error>> {
        Ok(AddressReceivers {
            p2pkh: Some(ZcashAddress::from_transparent_p2pkh(net, data).encode()),
            ..Default::default()
        })
    }
}

// Decomposes a Zcash address and returns the constituent receivers.
//
// This will accept any zcash address type, and break it down into the underlying receiver
// components. Note that a caller MUST check whether an address is a TEX address separately from
// using this method in order to determine whether it is permitted to send from the shielded pool
// to a p2pkh address extracted from the result.
#[wasm_bindgen]
pub fn get_address_receivers(addr_str: &str) -> Result<JsValue, JsValue> {
    let addr = parse_address(addr_str).map_err(|e| JsValue::from_str(&format!("{}", e)))?;

    let receivers = addr
        .convert::<AddressReceivers>()
        .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

    Ok(to_value(&receivers)?)
}
