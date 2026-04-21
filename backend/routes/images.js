import express from "express";

const router = express.Router();

// Use Pollinations.ai for free AI image generation
router.post("/images", async (req, res) => {
  const { prompt, style = "modern flat illustration" } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  const enhancedPrompt = `${prompt}, ${style}, professional, high quality, vibrant`;
  const encoded = encodeURIComponent(enhancedPrompt);

  // Pollinations.ai — free, no API key needed
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;

  // Unsplash as fallback
  const unsplashUrl = `https://source.unsplash.com/800x800/?${encodeURIComponent(prompt)}`;

  res.json({
    url: pollinationsUrl,
    fallback: unsplashUrl,
    prompt: enhancedPrompt,
  });
});

// Batch generate images for all slides
router.post("/images/batch", async (req, res) => {
  const { slides } = req.body;
  if (!slides || !Array.isArray(slides)) return res.status(400).json({ error: "slides array required" });

  const results = slides.map((slide) => {
    const encoded = encodeURIComponent(`${slide.visual_prompt}, modern flat illustration, professional, vibrant`);
    return {
      id: slide.id,
      url: `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&nologo=true&seed=${slide.id * 1337}`,
      fallback: `https://source.unsplash.com/800x800/?${encodeURIComponent(slide.visual_prompt)}`,
    };
  });

  res.json({ images: results });
});

export default router;