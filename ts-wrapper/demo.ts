import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// вычисляем абсолютный путь до index.js независимо от места запуска
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distModulePath = path.resolve(__dirname, "./dist/index.js");
const distModule = await import(pathToFileURL(distModulePath).href);

await distModule.initWasm();
console.log("Address type:", distModule.getZcashAddressType("t1XUKmDLFcRDxvf9A7tawmgePDN8NK6os35"));
