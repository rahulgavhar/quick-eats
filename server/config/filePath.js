// server/utils/filePath.js

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/**
 * __dirname of this file -> /server/utils
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Server root directory -> /server
 */
export const SERVER_ROOT = path.resolve(__dirname, "..");

/**
 * Centralized filesystem paths
 */
export const FILE_PATHS = {
  PUBLIC_DIR: path.join(SERVER_ROOT, "public"),
  UPLOADS_DIR: path.join(SERVER_ROOT, "public", "uploads"),
  TEMP_DIR: path.join(SERVER_ROOT, "temp"),
};

/**
 * Ensure required directories exist
 */
Object.values(FILE_PATHS).forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});
