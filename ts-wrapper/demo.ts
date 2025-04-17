import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const isDev = !!process.env.USE_SRC;
  const modulePath = path.resolve(__dirname, isDev ? "src/index.ts" : "src/index.js");
  const sdkModule = await import(pathToFileURL(modulePath).href);

  await sdkModule.initWasm();

  const testAddr = "t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35";
  const type = sdkModule.getZcashAddressType(testAddr);

  console.log("Address type:", type);
}

main();
