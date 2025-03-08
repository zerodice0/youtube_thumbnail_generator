import OpenAI from "openai";

const summarizeText = async (text: string): Promise<string | null> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `다음 문단을 50자 이내로 요약해줘.:\n\n ${text}`,
        },
      ],
    });

    const summary = completion.choices[0].message.content;
    return summary;
  } catch (error) {
    throw new Error(`❌ Summarizing error: ${error}`);
  }
};

export { summarizeText };
