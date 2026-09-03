// Vercel Serverless Function: /api/chat
// The Groq API key is read only from the server-side environment variable.
// Never put the key in frontend JavaScript or commit it to GitHub.

const MODEL = "openai/gpt-oss-120b";
const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY is not configured on the server.",
    });
  }

  try {
    const body = req.body || {};

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const messages = incomingMessages
      .filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string"
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, MAX_MESSAGE_CHARS),
      }))
      .filter((message) => message.content.length > 0)
      .slice(-MAX_HISTORY_MESSAGES);

    if (messages.length === 0) {
      return res.status(400).json({
        error: "No valid messages were provided.",
      });
    }

    const systemMessage = {
      role: "system",
      content:
        "You are Nova, a helpful, friendly, and accurate AI assistant. " +
        "Answer clearly and naturally. Use the conversation history to maintain context. " +
        "When the user asks for code, provide clean and properly formatted code. " +
        "Do not claim to remember information outside the conversation history provided.",
    };

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_completion_tokens: 1024,
        }),
      }
    );

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      const apiError =
        data?.error?.message || "Groq API request failed.";

      return res.status(groqResponse.status).json({
        error: apiError,
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({
        error: "Groq returned an empty response.",
      });
    }

    return res.status(200).json({
      reply: reply.trim(),
      model: MODEL,
    });
  } catch (error) {
    console.error("Nova API error:", error);

    return res.status(500).json({
      error:
        "Something went wrong while contacting Groq. Please try again.",
    });
  }
}
