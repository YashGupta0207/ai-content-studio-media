import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const callOpenRouter = async (messages) => {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
      }),
    });

    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
    } else {
        throw new Error("No choices in response");
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    throw err;
  }
};

callOpenRouter([{ role: "user", content: "Hello" }])
  .then(content => console.log("Content:", content))
  .catch(err => console.error("Final Error:", err));
