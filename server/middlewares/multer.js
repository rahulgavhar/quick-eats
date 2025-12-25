import multer from "multer";
import { FILE_PATHS } from "../config/filePath.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILE_PATHS.UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
