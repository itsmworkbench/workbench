import {OpenAI} from "openai";

export type AISuggestTxInput = {
  input: any
  output: any
}

export type AISuggestTxOutput = string

export type AISuggestTx = ( suggest: AISuggestTxInput ) => Promise<AISuggestTxOutput>

export type SuggestJsonSchemaInput = {
  input: any
}
export type SuggestJsonSchemaOutput = string

export type AISuggestJsonSchema = ( suggest: SuggestJsonSchemaInput ) => Promise<SuggestJsonSchemaOutput>

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

const openai = new OpenAI ( {
  apiKey: clientSecret,
});

export const generateJsonataExpression: AISuggestTx = async (suggest) => {
  const systemMessage = `Given the following input JSON:\n\n${JSON.stringify(suggest.input, null, 2)}\n\nAnd the desired output JSON:\n\n${JSON.stringify(suggest.output, null, 2)}\n\nGenerate a JSONata expression that transforms the input JSON to the output JSON. Only return the JSONata result.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {"role": "system", "content": systemMessage},
        {"role": "user", "content": "Please generate the JSONata expression."}
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });

    if (completion.choices && completion.choices.length > 0) {
      return JSON.parse(completion.choices[0].message.content) || "No JSONata expression generated.";
    } else {
      throw new Error("Failed to generate a JSONata expression.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

