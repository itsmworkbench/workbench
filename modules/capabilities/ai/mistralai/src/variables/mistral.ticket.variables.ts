import {AiTicketVariablesFn, TicketVariables} from "@itsmworkbench/ai";
import {AutoModelForCausalLM, AutoTokenizer, env, Tensor} from '@xenova/transformers';
import {
    realTicket1,
    realTicket2,
    realTicket3, realTicket4,
    response1,
    response2,
    response3, response4
} from "./mistral.ticket.prompts";

// Set up environment for transformer model
// env.localModelPath = '/model/mistralai';

export const mistralTicketVariables: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
    const systemPrompt = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. Return these variables only as in JSON format.`;
    const model = await AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2" );
    const tokenizer = await AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2");
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: realTicket1 },
        { role: "assistant", content: JSON.stringify(response1) },
        { role: "user", content: realTicket2 },
        { role: "assistant", content: JSON.stringify(response2) },
        { role: "user", content: realTicket3 },
        { role: "assistant", content: JSON.stringify(response3) },
        { role: "user", content: realTicket4 },
        { role: "assistant", content: JSON.stringify(response4) },
        { role: "user", content: ticket },
    ];

    const encodeds = tokenizer.apply_chat_template(messages, {return_tensor: true});
    const encodedInputs = new Tensor(encodeds['input_ids']);
    const generatedTokens = await model.generate(encodedInputs, {max_length: 512, do_sample: true});
    const decoded = tokenizer.batch_decode(generatedTokens);
    console.log ( 'MistralAI ticket variables for ticket: ', ticket )
    console.log(decoded[0]);

    return JSON.parse(decoded[0]);
}