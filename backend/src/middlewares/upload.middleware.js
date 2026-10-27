import multer from "multer";

const storage = multer.memoryStorage();

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

const imageFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid image type. Only JPG, JPEG, and PNG files are allowed.",
      ),
    );
  }
};

export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const proofFilter = (_req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid proof type. Allowed: PDF, JPG, JPEG, and PNG"));
  }
};

export const uploadProofs = multer({
  storage,
  fileFilter: proofFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
