import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return Response.json({
      data: completion.choices?.[0]?.message?.content || "",
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}