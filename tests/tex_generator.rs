use web_sys::console;
use zcash_address::{ToAddress, ZcashAddress};
use zcash_protocol::consensus::NetworkType;

pub fn generate_tex_address() -> String {
    let tex_data: [u8; 20] = [0u8; 20]; // some bytes
    let address = ZcashAddress::from_tex(NetworkType::Main, tex_data);
    let encoded = address.encode();
    //  Log to the browser console
    console::log_1(&format!("Generated TEX address: {}", encoded).into());
    encoded
}
