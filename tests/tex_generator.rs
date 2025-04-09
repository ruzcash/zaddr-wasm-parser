use zcash_address::{ZcashAddress, ToAddress};
use zcash_protocol::consensus::NetworkType;
use web_sys::console;


pub fn generate_tex_address() -> String {
    let tex_data: [u8; 20] = [0u8; 20]; // Фиктивные байты, можно заменить на random
    let address = ZcashAddress::from_tex(NetworkType::Main, tex_data);
    let encoded = address.encode();
    // 🔍 Логируем в консоль браузера
    console::log_1(&format!("Generated TEX address: {}", encoded).into());
    encoded
}
