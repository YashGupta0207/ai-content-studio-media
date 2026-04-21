import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callOpenRouter } from "../utils/openrouter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();
const upload = multer({
    dest: uploadsDir,
    limits: { fileSize: 10 * 1024 * 1024 },
});

// Extract text from PDF buffer using pdfjs-dist (proper ESM support, no CJS issues)
async function extractPdfText(buffer) {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDoc = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
        if (fullText.length > 4000) break;
    }

    return fullText.replace(/\s+/g, " ").trim();
}

router.post("/upload", upload.single("file"), async (req, res) => {
    let filePath = null;
    try {
        const format = req.body.format || "carousel";

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        filePath = req.file.path;
        let text = "";

        const isPdf =
            req.file.mimetype === "application/pdf" ||
            req.file.originalname?.toLowerCase().endsWith(".pdf");

        if (isPdf) {
            const buffer = fs.readFileSync(filePath);
            text = await extractPdfText(buffer);
            text = text.slice(0, 3000);
        } else {
            text = fs.readFileSync(filePath, "utf-8").slice(0, 3000);
        }

        // Clean up temp file
        try { fs.unlinkSync(filePath); filePath = null; } catch { }

        if (!text || text.length < 10) {
            return res.status(400).json({
                error: "Could not extract text from the file. Please try a different file.",
            });
        }

        const slideCount =
            format === "story" ? "3-5 vertical slides" :
                format === "post" ? "1 slide" :
                    "4-6 slides";

        const prompt = `You are a social media content strategist for Cuemath (ed-tech, audience: parents 25-45).

Extract the key educational insights from this document and convert them into a ${format} (${slideCount}).

Document content:
${text}

Return ONLY valid JSON with no markdown fences:
{
  "title": "",
  "format": "${format}",
  "aspect_ratio": "${format === "story" ? "9:16" : "1:1"}",
  "slides": [
    {
      "id": 1,
      "heading": "",
      "body": "",
      "visual_prompt": "detailed image generation description with mood, colors, style",
      "color_theme": "#hex",
      "emoji": "",
      "slide_type": "hook|content|cta"
    }
  ]
}`;

        let output = await callOpenRouter([{ role: "user", content: prompt }]);
        output = output.replace(/```json|```/g, "").trim();

        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Model did not return valid JSON");

        res.json(JSON.parse(jsonMatch[0]));
    } catch (err) {
        if (filePath) { try { fs.unlinkSync(filePath); } catch { } }
        console.error("[upload] Error:", err);
        res.status(500).json({ error: err.message || "Upload processing failed" });
    }
});

export default router;