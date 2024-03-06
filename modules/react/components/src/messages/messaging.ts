import { AppendEvent } from "@itsmworkbench/events";
import { SideEffect } from "@itsmworkbench/react_core";
import { BaseMessage } from "@itsmworkbench/domain";


export function makeSideeffectForMessage<M extends BaseMessage> ( message: M ): SideEffect {
  const event: AppendEvent = { event: 'append', path: 'conversation.messages', value: message, context: {} };
  let sideEffect: SideEffect = { command: 'event', event };
  return sideEffect;
}
