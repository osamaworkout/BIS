import { apiUrl, ImportResponse } from "./types";

export async function addStudentsUsingFile(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${apiUrl}/Students/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to upload students file");
  }

  const result: ImportResponse = await res.json();
  return result;
}
