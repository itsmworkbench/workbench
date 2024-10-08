import { ConversationHistory } from "./conversation.history";
import { DisplayChatArea } from "./conversation.chatarea";
import { UserTypingBox } from "./userTypingBox";
import React, { ReactNode } from "react";
import { LensProps2 } from "@focuson/state";
import { Conversation } from "@itsmworkbench/domain";
import { SideEffect } from "@itsmworkbench/react_core";
import { ConversationPlugin } from "./conversation.plugin";
import { MainAndTypingLayout } from "@itsmworkbench/components";

export interface ConversationHistoryAndChatProps<S> extends LensProps2<S, Conversation, SideEffect[], any> {
  plugins: ConversationPlugin<S>[]
}
export function ConversationHistoryAndChat<S> ( { state, plugins }: ConversationHistoryAndChatProps<S> ) {
  return <MainAndTypingLayout
    Main={<ConversationHistory plugins={plugins} state={state.state1 ()} def={m => <div>{JSON.stringify ( m )}</div>}/>}
    Typing={
      <><DisplayChatArea plugins={plugins} state={state} def={
        <UserTypingBox state={state.focus1On ( 'chat' ).focus1On ( 'data' )} from='me'/>}/>
      </>}
  />
}

