import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const filePath = "uploads/061a7e286d112a86a3a7dfb14151e93d";

async function testPdfNew() {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        console.log("File read successfully, size:", dataBuffer.length);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        console.log("PDF parsed successfully");
        console.log("Text length:", data.text.length);
        console.log("Preview:", data.text.slice(0, 100));
    } catch (err) {
        console.error("PDF Parse Error:", err);
    }
}

testPdfNew();
