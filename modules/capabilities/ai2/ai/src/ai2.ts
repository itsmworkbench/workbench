// Define the three possible roles that a message can have
import {ErrorsOr} from "@itsmworkbench/errors";

export type ChatCompletionRole = 'system' | 'assistant' | 'user';

// A single message, which has a role and some textual content
export interface ChatCompletionMessage {
    role: ChatCompletionRole;
    content: string;
}

export type ChatCompletionFn = (req: ChatCompletionMessage[]) => Promise<ErrorsOr<ChatCompletionMessage>>;


