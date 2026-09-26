import imageCompression from "browser-image-compression";
import api from "./api";

export async function uploadImage(file: File): Promise<string> {
  // 1. Validate
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // 2. Compress if needed
  const compressed =
    file.size < 1_000_000
      ? file
      : await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });

  // 3. Upload
  const formData = new FormData();
  formData.append("file", compressed, file.name);

    const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url as string;
}