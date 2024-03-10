import { AppendEvent } from "@itsmworkbench/events";
import { EventSideEffect, SideEffect } from "@itsmworkbench/react_core";
import { BaseMessage } from "@itsmworkbench/domain";


export function makeSideeffectForMessage<M extends BaseMessage> ( message: M ): SideEffect {
  const event: AppendEvent = {
    event: 'append', path: 'conversation.messages', value: message, context: {
      display: {
        "title": "Message",
        "type": "message",
      }
    }
  };
  let sideEffect: EventSideEffect = { command: 'event', event };
  return sideEffect;
}
