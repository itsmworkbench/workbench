import {makeContextFor, makeContextForState} from "@itsmworkbench/react_utils";
import {ChatCompletionFn, ChatCompletionMessage, RememberChatCompletion, RememberChatCompletionFn} from "@itsmworkbench/ai2";
import {useCallback} from "react";
import {ErrorsOr} from "@itsmworkbench/errors";


export const {use: useChatCompletion, Provider: ChatCompletionProvider} = makeContextFor<ChatCompletionFn, 'chatCompletion'>('chatCompletion')
export const {use: useRememberChatCompletion, Provider: RememberChatCompletionProvider} = makeContextForState<RememberChatCompletion[], 'remember'>('remember')

export function useRememberChatCompletionFn(): RememberChatCompletionFn {
    const [remembered, setRemembered] = useRememberChatCompletion()
    return useCallback((req: ChatCompletionMessage[], res: ErrorsOr<ChatCompletionMessage>) => {
        const remember: RememberChatCompletion = {req, res};
        return setRemembered(old => [...old, remember]);
    }, [])
}

