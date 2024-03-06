import { LensState, LensState2 } from "@focuson/state";
import { BaseMessage, ChatDisplayData } from "@itsmworkbench/domain";
import React from "react";
import { SideEffect } from "@itsmworkbench/react_core";

export interface ConversationPlugin<S> {
  type: string;
  view: ( state: LensState<S, BaseMessage, any> ) => React.ReactElement
  chat: ( state: LensState2<S, ChatDisplayData<any>,SideEffect[], any> ) => React.ReactElement
}
