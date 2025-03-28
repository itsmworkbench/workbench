// Define the three possible roles that a message can have
import {ErrorsOr} from "@itsmworkbench/errors";
import {NameAnd} from "@itsmworkbench/utils";

export const aiDebugName = 'ai'
export const showAiPromptsFFName = 'showAiPrompts'

export type ChatCompletionRole = 'system' | 'assistant' | 'user';

// A single message, which has a role and some textual content
export interface ChatCompletionMessage {
    role: ChatCompletionRole;
    content: string;
}

export type ChatCompletionFn = (req: ChatCompletionMessage[]) => Promise<ErrorsOr<ChatCompletionMessage>>;

export type RememberChatCompletion = {
    req: ChatCompletionMessage[],
    res: ErrorsOr<ChatCompletionMessage>
}

export type RememberChatCompletionFn = (req: ChatCompletionMessage[], res: ErrorsOr<ChatCompletionMessage>) => void;
export const noRememberChatCompletion: RememberChatCompletionFn = () => {}




}
