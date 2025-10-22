// backend/loadEnv.js
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force-load the .env beside server.js
dotenv.config({ path: path.join(__dirname, ".env") });
