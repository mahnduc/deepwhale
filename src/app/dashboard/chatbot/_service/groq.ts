export const callGroqChat = async (
  randomKey: string,
  messages: any[],      // tất cả chat của đoạn hội thoại
  userContent: string   // chat cụ thể
) => {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${randomKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userContent },
        ],
      }),
    }
  );

  const data = await response.json();

  return {
    ok: response.ok,
    data,
  };
};