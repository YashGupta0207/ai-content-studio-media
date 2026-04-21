import express from "express";
import { callOpenRouter } from "../utils/openrouter.js";

const router = express.Router();

const FORMAT_RULES = {
  carousel: {
    slideCount: "4-7 slides",
    structure: "Slide 1 = Bold Hook, middle slides = one insight each, last = CTA",
    copyLength: "heading max 8 words, body max 30 words",
    aspect: "1:1",
  },
  story: {
    slideCount: "3-5 slides",
    structure: "Vertical format. Big bold text. Slide 1 = hook question/stat, middle = tips, last = CTA",
    copyLength: "heading max 6 words, body max 20 words",
    aspect: "9:16",
  },
  post: {
    slideCount: "exactly 1 slide",
    structure: "Strong headline + supporting line. Single powerful visual.",
    copyLength: "heading max 10 words, body max 40 words",
    aspect: "1:1",
  },
};

const buildPrompt = (idea, format = "carousel") => {
  const rules = FORMAT_RULES[format] || FORMAT_RULES.carousel;
  return `
You are a world-class social media content strategist for Cuemath — an ed-tech brand helping children learn math. Audience: parents aged 25-45.

Brand voice: Smart, warm, reassuring, clear. Never jargon-heavy. Think "brilliant friend who knows child psychology."

Convert this idea into ${format} content:
- ${rules.slideCount}
- Structure: ${rules.structure}
- Copy length: ${rules.copyLength}
- visual_prompt: detailed AI image generation description — mood, colors, subjects, style. E.g. "minimalist illustration of a child at a desk, warm amber lighting, geometric shapes floating, flat design, pastel palette"
- color_theme: suggest a hex accent color for this slide (vary across slides)
- emoji: one relevant emoji

Return ONLY valid JSON, no markdown:
{
  "title": "",
  "format": "${format}",
  "aspect_ratio": "${rules.aspect}",
  "slides": [
    {
      "id": 1,
      "heading": "",
      "body": "",
      "visual_prompt": "",
      "color_theme": "#hex",
      "emoji": "",
      "slide_type": "hook|content|cta"
    }
  ]
}

Idea: ${idea}
`;
};

// Generate full carousel/post/story
router.post("/generate", async (req, res) => {
  const { idea, format = "carousel" } = req.body;
  if (!idea) return res.status(400).json({ error: "idea is required" });

  try {
    let output = await callOpenRouter([{ role: "user", content: buildPrompt(idea, format) }]);
    output = output.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(output));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Regenerate a single slide
router.post("/regenerate-slide", async (req, res) => {
  const { slide, instruction, format = "carousel" } = req.body;
  if (!slide) return res.status(400).json({ error: "slide is required" });

  const prompt = `
You are a social media content expert for Cuemath (ed-tech, audience: parents).

Regenerate this single slide for a ${format}.
${instruction ? `Instruction: ${instruction}` : "Make it more engaging and punchy."}

Current slide:
Heading: ${slide.heading}
Body: ${slide.body}
Type: ${slide.slide_type}

Return ONLY valid JSON for one slide:
{
  "heading": "",
  "body": "",
  "visual_prompt": "",
  "color_theme": "#hex",
  "emoji": "",
  "slide_type": "${slide.slide_type}"
}
`;

  try {
    let output = await callOpenRouter([{ role: "user", content: prompt }]);
    output = output.replace(/```json|```/g, "").trim();
    const updated = JSON.parse(output);
    res.json({ ...slide, ...updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rewrite copy with a specific tone instruction
router.post("/rewrite", async (req, res) => {
  const { slides, instruction } = req.body;
  if (!slides || !instruction) return res.status(400).json({ error: "slides and instruction required" });

  const prompt = `
Rewrite these carousel slide texts following this instruction: "${instruction}"
Keep the same JSON structure. Only change heading and body text. Keep visual_prompt, color_theme, emoji, slide_type unchanged.

Current slides:
${JSON.stringify(slides, null, 2)}

Return ONLY valid JSON array of slides.
`;

  try {
    let output = await callOpenRouter([{ role: "user", content: prompt }]);
    output = output.replace(/```json|```/g, "").trim();
    res.json({ slides: JSON.parse(output) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;