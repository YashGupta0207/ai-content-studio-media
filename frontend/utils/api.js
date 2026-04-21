// Dynamically resolve API base: same origin in production, localhost in dev
const BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? `http://${window.location.hostname}:5000/api`
    : `${window.location.origin}/api`;

export const generateContent = async (idea, format = "carousel") => {
  const res = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, format }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Generation failed");
  }
  return res.json();
};

export const regenerateSlide = async (slide, instruction, format) => {
  const res = await fetch(`${BASE}/regenerate-slide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slide, instruction, format }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Slide regeneration failed");
  }
  return res.json();
};

export const rewriteAll = async (slides, instruction) => {
  const res = await fetch(`${BASE}/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slides, instruction }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Rewrite failed");
  }
  return res.json();
};

export const generateImage = async (prompt) => {
  const res = await fetch(`${BASE}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Image generation failed");
  }
  return res.json();
};

export const generateImagesBatch = async (slides) => {
  const res = await fetch(`${BASE}/images/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slides }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Batch image generation failed");
  }
  return res.json();
};

export const uploadFileAPI = async (file, format = "carousel") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type header — browser must set it with boundary for multipart
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
};