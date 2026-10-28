import { describe, it, expect } from "vitest";
import { buildFileUrl } from "../fileUrl";

describe("buildFileUrl utility", () => {
  it("returns empty string when filePath is falsy", () => {
    expect(buildFileUrl("")).toBe("");
    expect(buildFileUrl(null)).toBe("");
  });

  it("leaves absolute HTTP/HTTPS URLs untouched", () => {
    expect(buildFileUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")).toBe(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );
    expect(buildFileUrl("http://example.com/photo.png")).toBe(
      "http://example.com/photo.png"
    );
  });

  it("preserves frontend public static assets under /images/", () => {
    expect(buildFileUrl("/images/opportunities/disaster-relief.jpg")).toBe(
      "/images/opportunities/disaster-relief.jpg"
    );
    expect(buildFileUrl("images/opportunities/disaster-relief.jpg")).toBe(
      "/images/opportunities/disaster-relief.jpg"
    );
  });
});

