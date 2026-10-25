import multer from "multer"; import fs from "fs"; import { v2 as cloudinary } from "cloudinary";
fs.mkdirSync("uploads", { recursive: true });
export const upload = multer({ storage: multer.diskStorage({ destination: "uploads", filename: (_, f, cb) => cb(null, Date.now() + "-" + f.originalname.replace(/\s/g, "_")) }),
  fileFilter: (_, f, cb) => cb(null, /\.(pdf|jpe?g|png)$/i.test(f.originalname)), limits: { fileSize: 5e6 } });
const useCloud = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (useCloud) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
// Cloudinary when configured, otherwise (or on failure) local storage fallback
export const storeReceipt = async (file) => { if (!useCloud) return `/uploads/${file.filename}`;
  try { const r = await cloudinary.uploader.upload(file.path, { folder: "meridian/receipts", resource_type: "auto" }); fs.unlink(file.path, () => {}); return r.secure_url; }
  catch (e) { console.error("Cloudinary failed, using local:", e.message); return `/uploads/${file.filename}`; } };
