import { regenerateSlide, generateImage } from "../utils/api.js";

const SLIDE_TYPE_STYLES = {
  hook: { badge: "🎯 HOOK", badgeColor: "#FF6B6B" },
  content: { badge: "💡 INSIGHT", badgeColor: "#4ECDC4" },
  cta: { badge: "📣 CTA", badgeColor: "#F59E0B" },
};

// SVG icons as inline strings
const ICON_REGEN = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
const ICON_IMG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
const SPINNER = `<span class="btn-loading-spin"></span>`;

export const createSlide = (slide, format = "carousel", callbacks = {}) => {
  const { onUpdate } = callbacks;
  const isStory = format === "story";
  const typeStyle = SLIDE_TYPE_STYLES[slide.slide_type] || SLIDE_TYPE_STYLES.content;
  const accentColor = slide.color_theme || "#7C6FF7";

  // ── wrapper ──────────────────────────────────────────────────────────────────
  const wrapper = document.createElement("div");
  wrapper.className = `slide-wrapper${isStory ? " story" : ""}`;
  wrapper.dataset.slideId = slide.id;

  // ── inner HTML ────────────────────────────────────────────────────────────────
  wrapper.innerHTML = `
    <div class="slide${isStory ? " story-slide" : ""}" style="--accent:${accentColor}">

      <div class="slide-badge"
           style="background:${typeStyle.badgeColor}22;color:${typeStyle.badgeColor};border:1px solid ${typeStyle.badgeColor}44">
        ${typeStyle.badge}
      </div>

      <div class="slide-img-wrap">
        <img class="slide-img" src="" alt="" />
        <div class="slide-img-overlay"></div>
        <div class="slide-emoji">${slide.emoji || "✨"}</div>
      </div>

      <div class="slide-content">
        <h3 class="slide-heading" contenteditable="true" spellcheck="false">${slide.heading || ""}</h3>
        <p  class="slide-body"    contenteditable="true" spellcheck="false">${slide.body || ""}</p>
      </div>

      <div class="slide-actions">
        <button class="btn-regen">${ICON_REGEN} Regenerate</button>
        <button class="btn-img"  >${ICON_IMG}   New Image</button>
      </div>

      <div class="slide-footer">
        <span class="slide-num">${slide.id}</span>
        <span class="cuemath-brand">Cuemath</span>
      </div>

    </div>
  `;

  // ── image ─────────────────────────────────────────────────────────────────────
  const img = wrapper.querySelector(".slide-img");
  const setImg = (url) => {
    if (!url) return;
    const i = new Image();
    i.onload = () => { img.src = url; };
    i.onerror = () => {
      img.src = `https://source.unsplash.com/800x800/?${encodeURIComponent(slide.visual_prompt || "education")}`;
    };
    i.src = url;
  };
  setImg(slide.image || `https://source.unsplash.com/800x800/?${encodeURIComponent(slide.visual_prompt || "education,children")}`);

  // ── live content editable sync ────────────────────────────────────────────────
  const headingEl = wrapper.querySelector(".slide-heading");
  const bodyEl = wrapper.querySelector(".slide-body");

  headingEl.addEventListener("input", () => {
    slide.heading = headingEl.innerText;
    onUpdate?.(slide);
  });
  bodyEl.addEventListener("input", () => {
    slide.body = bodyEl.innerText;
    onUpdate?.(slide);
  });

  // ── REGENERATE button ─────────────────────────────────────────────────────────
  const regenBtn = wrapper.querySelector(".btn-regen");

  regenBtn.addEventListener("click", async () => {
    if (regenBtn.disabled) return;

    // Ask for optional instruction (non-blocking; empty string = default)
    const instruction = window.prompt(
      "Regeneration instruction (leave blank for default):",
      ""
    );
    // null means user cancelled the prompt dialog
    if (instruction === null) return;

    // Loading state
    regenBtn.disabled = true;
    regenBtn.innerHTML = `${SPINNER} Regenerating…`;

    try {
      const updated = await regenerateSlide(slide, instruction, format);

      // Merge updates back into slide object
      Object.assign(slide, updated);

      // Update DOM
      headingEl.innerText = updated.heading || headingEl.innerText;
      bodyEl.innerText = updated.body || bodyEl.innerText;

      const emojiEl = wrapper.querySelector(".slide-emoji");
      if (emojiEl && updated.emoji) emojiEl.textContent = updated.emoji;

      // Update accent colour
      const slideEl = wrapper.querySelector(".slide");
      if (updated.color_theme) slideEl.style.setProperty("--accent", updated.color_theme);

      // Fetch new image for the updated visual_prompt
      if (updated.visual_prompt) {
        try {
          const imgData = await generateImage(updated.visual_prompt);
          setImg(imgData.url || imgData.fallback);
        } catch (_) {
          setImg(`https://source.unsplash.com/800x800/?${encodeURIComponent(updated.visual_prompt)}`);
        }
      }

      onUpdate?.(slide);
    } catch (err) {
      console.error("Regenerate slide error:", err);
      window.showToastGlobal?.("Regeneration failed — check console", "error");
    } finally {
      regenBtn.disabled = false;
      regenBtn.innerHTML = `${ICON_REGEN} Regenerate`;
    }
  });

  // ── NEW IMAGE button ──────────────────────────────────────────────────────────
  const imgBtn = wrapper.querySelector(".btn-img");

  imgBtn.addEventListener("click", async () => {
    if (imgBtn.disabled) return;

    imgBtn.disabled = true;
    imgBtn.innerHTML = `${SPINNER} Loading…`;

    try {
      const imgData = await generateImage(slide.visual_prompt || slide.heading || "education");
      // Force a new image by appending a random seed param
      const freshUrl = (imgData.url || imgData.fallback) + `&_t=${Date.now()}`;
      setImg(freshUrl);
    } catch (err) {
      console.error("New image error:", err);
      // Fallback: Unsplash with timestamp to get a different photo
      setImg(`https://source.unsplash.com/800x800/?${encodeURIComponent(slide.visual_prompt || "learning")}&sig=${Date.now()}`);
    } finally {
      imgBtn.disabled = false;
      imgBtn.innerHTML = `${ICON_IMG} New Image`;
    }
  });

  return wrapper;
};