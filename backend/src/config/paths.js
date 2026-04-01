import os from "os";
import path from "path";

export const UPLOADS_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "servespot-uploads")
  : path.join(process.cwd(), "uploads");
