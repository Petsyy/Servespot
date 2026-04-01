import path from "path";
import { deleteAsset, uploadBuffer } from "../config/cloudinary.js";

function sanitizeName(value = "file") {
  return value.replace(/[^a-zA-Z0-9-_]/g, "_");
}

export async function uploadFileToCloudinary(file, folder) {
  if (!file?.buffer) {
    return null;
  }

  const ext = path.extname(file.originalname || "") || "";
  const baseName = path.basename(file.originalname || "upload", ext);
  const publicId = `${Date.now()}-${sanitizeName(baseName)}`;

  const result = await uploadBuffer(file.buffer, {
    folder,
    public_id: publicId,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  };
}

export async function deleteCloudinaryFile(publicId, resourceType) {
  return deleteAsset(publicId, resourceType || "image");
}
