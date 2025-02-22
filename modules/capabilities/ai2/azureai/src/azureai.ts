import {ChatCompletionMessage, ChatCompletionFn} from "@itsmworkbench/ai2";
import {useSecretData} from "@itsmworkbench/secrets";


export interface ChatCompletionRequest {
    model: string;
    messages: ChatCompletionMessage[];
    // You can optionally include more parameters here,
    // like max_tokens, temperature, etc.
}

export type ChatCompletion = {
    index: number;
    message: ChatCompletionMessage;
    finish_reason?: string;
}

// A response from the OpenAI Chat Completion API
export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    choices: ChatCompletion[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
