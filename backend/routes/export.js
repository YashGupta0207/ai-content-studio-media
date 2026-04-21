import express from "express";

const router = express.Router();

// Export metadata — actual PNG export is done client-side with html2canvas
router.post("/export", (req, res) => {
  const { slides, format, title } = req.body;

  if (!slides || !Array.isArray(slides)) {
    return res.status(400).json({ error: "slides array required" });
  }

  res.json({
    status: "ok",
    message: "Use client-side html2canvas for PNG export",
    slideCount: slides.length,
    format,
    title,
    exportedAt: new Date().toISOString(),
  });
});

export default router;