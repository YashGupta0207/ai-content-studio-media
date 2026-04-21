import fetch from "node-fetch";

export const callOpenRouter = async (messages, systemPrompt = null) => {
    const msgs = systemPrompt
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : messages;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://social-studio.cuemath.com",
            "X-Title": "Cuemath Social Studio",
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: msgs,
            temperature: 0.8,
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();

    if (!data.choices?.[0]?.message?.content) {
        throw new Error("OpenRouter returned no content: " + JSON.stringify(data).slice(0, 300));
    }

    return data.choices[0].message.content;
};