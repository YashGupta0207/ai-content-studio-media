import sys
import json
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
import os

idea = sys.argv[1]
format_type = sys.argv[2] if len(sys.argv) > 2 else "carousel"

llm = ChatOpenAI(
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    model_name="openai/gpt-4o-mini"
)

format_instructions = {
    "carousel": """
- 4-7 slides
- Slide 1 = Bold Hook (stops the scroll)
- Slides 2-N-1 = Value / Explanation (each slide = one key insight)
- Last slide = Clear CTA (save, share, follow)
- Each slide: short heading (max 8 words), body (max 30 words), visual_prompt
- aspect_ratio: "1:1"
""",
    "story": """
- 3-5 slides
- Vertical format (9:16)
- Big bold text, minimal copy
- Slide 1 = Hook question or stat
- Middle = Quick tips/points
- Last = CTA
- aspect_ratio: "9:16"
""",
    "post": """
- Single slide
- Strong headline + supporting line
- Visual should be eye-catching
- aspect_ratio: "1:1"
- Return slides array with exactly 1 item
"""
}

prompt = PromptTemplate(
    input_variables=["idea", "format_rules"],
    template="""
You are a world-class social media content strategist for Cuemath — an ed-tech brand that helps children learn math. Your audience is parents aged 25-45.

Brand voice: Smart, warm, reassuring, clear. Never jargon-heavy. Think "brilliant friend who happens to know child psychology."

Convert this idea into social media content following these format rules:
{format_rules}

Rules:
- heading: punchy, curiosity-driving, max 8 words
- body: clear, parent-friendly, conversational, max 35 words  
- visual_prompt: detailed description for AI image generation — describe mood, colors, subjects. Be specific. E.g. "minimalist illustration of a child at a desk, warm amber lighting, geometric shapes floating around, flat design style"
- color_theme: suggest a hex color for this slide's accent (vary across slides for visual rhythm)
- emoji: one relevant emoji for the slide

Return ONLY valid JSON (no markdown, no explanation):
{{
  "title": "",
  "format": "{format_type}",
  "brand_color": "#6C63FF",
  "slides": [
    {{
      "id": 1,
      "heading": "",
      "body": "",
      "visual_prompt": "",
      "color_theme": "#hex",
      "emoji": "",
      "slide_type": "hook|content|cta"
    }}
  ]
}}

Idea: {idea}
"""
)

chain = prompt | llm
result = chain.invoke({
    "idea": idea,
    "format_rules": format_instructions.get(format_type, format_instructions["carousel"]),
    "format_type": format_type
})

print(result.content)