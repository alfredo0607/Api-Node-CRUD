import sharp from "sharp";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = path.join(__dirname, "../uploads/profile");

const helperImg = (filePath, fileName, size = 300) => {
  return sharp(filePath).resize(size).toFile(`${data}/${fileName}`);
};

export default helperImg;
