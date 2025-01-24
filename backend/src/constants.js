import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const DB_NAME = "stockpiece";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { DB_NAME, __dirname };
