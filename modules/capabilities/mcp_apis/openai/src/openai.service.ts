import OpenAI from "openai";

let openai = new OpenAI({
    apiKey: "sk-proj-",
    dangerouslyAllowBrowser: true
});

export async function openaiCompletion(messages: any) {

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages
    });

    const text = response.choices?.[0]?.message?.content ?? "";

    return { text };
}
