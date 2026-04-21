import {
  generateContent,
  generateImagesBatch,
  uploadFileAPI,
  rewriteAll,
} from "./utils/api.js";
import { createSlide } from "./components/slideCard.js";

// ─── State ─────────────────────────────────────────────────────────────────────
let state = {
  slides: [],
  format: "carousel",
  title: "",
  mode: "idea",
};

// ─── Global toast (used by slideCard too) ─────────────────────────────────────
let _toastTimeout;
window.showToastGlobal = (msg, type = "info") => {
  const toast = document.getElementById("toast");
  if (!toast) return;
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.textContent = `${icons[type] || ""} ${msg}`;
  toast.className = `toast toast-${type} show`;
  clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => toast.classList.remove("show"), 3200);
};

// ─── Mode ──────────────────────────────────────────────────────────────────────
window.setMode = (mode) => {
  state.mode = mode;
  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`[data-mode="${mode}"]`)?.classList.add("active");
  document.getElementById("ideaMode").style.display = mode === "idea" ? "flex" : "none";
  document.getElementById("fileMode").style.display = mode === "file" ? "flex" : "none";
};

// ─── Format ────────────────────────────────────────────────────────────────────
window.setFormat = (fmt) => {
  state.format = fmt;
  document.querySelectorAll(".format-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`[data-format="${fmt}"]`)?.classList.add("active");
};

// ─── Generate from idea ────────────────────────────────────────────────────────
window.generate = async () => {
  const idea = document.getElementById("idea").value.trim();
  if (!idea) { window.showToastGlobal("Please enter an idea first", "error"); return; }

  showLoading("✨ Crafting your content…");

  try {
    const data = await generateContent(idea, state.format);
    state.title = data.title || "Untitled";
    state.slides = data.slides || [];

    render(state.slides);
    updateMeta(state.title, state.slides.length);
    window.showToastGlobal("Slides ready! Images loading in background…", "success");

    // Images load after render so text is visible immediately
    loadImages(state.slides);
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
};

// ─── Upload file ───────────────────────────────────────────────────────────────
window.uploadFile = async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) { window.showToastGlobal("Please select a file first", "error"); return; }

  showLoading("📄 Analysing your document…");

  try {
    const data = await uploadFileAPI(file, state.format);
    state.title = data.title || "Untitled";
    state.slides = data.slides || [];

    render(state.slides);
    updateMeta(state.title, state.slides.length);
    window.showToastGlobal("Document converted! Images loading…", "success");

    loadImages(state.slides);
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
};

// ─── Rewrite all ───────────────────────────────────────────────────────────────
window.rewriteContent = async () => {
  if (!state.slides.length) { window.showToastGlobal("Generate content first", "error"); return; }
  const instruction = document.getElementById("rewriteInstruction").value.trim();
  if (!instruction) { window.showToastGlobal("Enter a rewrite instruction", "error"); return; }

  window.showToastGlobal("Rewriting all slides…", "info");

  try {
    const { slides } = await rewriteAll(state.slides, instruction);
    state.slides = slides;
    render(state.slides);
    updateMeta(state.title, state.slides.length);
    loadImages(state.slides);
    window.showToastGlobal("Content rewritten!", "success");
  } catch (err) {
    window.showToastGlobal(err.message, "error");
  }
};

// ─── Export ────────────────────────────────────────────────────────────────────
window.exportSlides = async () => {
  if (!state.slides.length) { window.showToastGlobal("Nothing to export", "error"); return; }

  if (typeof html2canvas !== "undefined") {
    window.showToastGlobal("Exporting slides as PNG…", "info");
    const cards = document.querySelectorAll(".slide");
    let idx = 1;
    for (const card of cards) {
      const canvas = await html2canvas(card, { useCORS: true, scale: 2 });
      const a = document.createElement("a");
      a.download = `${state.title || "slide"}-${idx++}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    }
    window.showToastGlobal("Slides exported!", "success");
  } else {
    window.showToastGlobal("Right-click any slide and save image, or add html2canvas to export.", "info");
  }
};

// ─── Render slides ─────────────────────────────────────────────────────────────
function render(slides) {
  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  if (!slides.length) return;

  const container = document.createElement("div");
  container.className = `slides-container format-${state.format}`;

  slides.forEach((s) => {
    const card = createSlide(s, state.format, {
      onUpdate: (updated) => {
        const i = state.slides.findIndex((sl) => sl.id === updated.id);
        if (i !== -1) state.slides[i] = updated;
      },
    });
    container.appendChild(card);
  });

  preview.appendChild(container);

  // Show/hide rewrite panel and preview header
  document.getElementById("rewriteSection").style.display = "block";
  document.getElementById("previewHeader").style.display = "flex";
}

// ─── Load images in background (batch API) ─────────────────────────────────────
async function loadImages(slides) {
  try {
    const { images } = await generateImagesBatch(slides);
    images.forEach(({ id, url, fallback }) => {
      const slide = state.slides.find((s) => s.id === id);
      if (slide) slide.image = url;

      // Inject image directly into the already-rendered card
      const wrapper = document.querySelector(`[data-slide-id="${id}"]`);
      if (wrapper) {
        const img = wrapper.querySelector(".slide-img");
        if (img) {
          img.onload = null;
          img.onerror = () => { img.src = fallback; };
          img.src = url;
        }
      }
    });
  } catch (e) {
    // Silently fall back — Unsplash fallback is already set in createSlide
    console.warn("Batch image generation unavailable, using Unsplash fallback");
  }
}

// ─── UI helpers ────────────────────────────────────────────────────────────────
function showLoading(msg = "Processing…") {
  document.getElementById("preview").innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>${msg}</p>
      <span class="loading-sub">This usually takes 5–10 seconds</span>
    </div>`;
  document.getElementById("rewriteSection").style.display = "none";
  document.getElementById("previewHeader").style.display = "none";
}

function showError(msg) {
  document.getElementById("preview").innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>Something went wrong</p>
      <span>${msg}</span>
    </div>`;
}

function updateMeta(title, count) {
  const titleEl = document.getElementById("carouselTitle");
  const countEl = document.getElementById("slideCount");
  if (titleEl) titleEl.textContent = title;
  if (countEl) countEl.textContent = `${count} slide${count !== 1 ? "s" : ""}`;
}

// ─── Init ──────────────────────────────────────────────────────────────────────
setMode("idea");
setFormat("carousel");

// Hide rewrite section and header initially
document.getElementById("rewriteSection").style.display = "none";
document.getElementById("previewHeader").style.display = "none";