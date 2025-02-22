import {makeContextFor} from "@itsmworkbench/react_utils";
import {ChatCompletionFn} from "@itsmworkbench/ai2";


export const {use: useChatCompletion, Provider: ChatCompletionProvider} = makeContextFor<ChatCompletionFn, 'chatCompletion'>('chatCompletion')
