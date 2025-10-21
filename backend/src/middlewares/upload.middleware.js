import multer from "multer";
import path from "path";

/* ---------------------------------------------
   🧱 Shared Storage Engine
--------------------------------------------- */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

/* ---------------------------------------------
   🏢 Organization Documents Upload
   Allowed: .pdf, .docx, .jpg, .jpeg, .png
--------------------------------------------- */
const docFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid document type. Allowed: PDF, DOCX, JPG, PNG"));
  }
};

export const uploadDocs = multer({
  storage,
  fileFilter: docFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/* ---------------------------------------------
   🌍 Opportunity Image Upload
   Allowed: .jpg, .jpeg, .png ONLY
--------------------------------------------- */
const imageFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid image type. Only JPG, JPEG, and PNG files are allowed.")
    );
  }
};

export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for images
});
