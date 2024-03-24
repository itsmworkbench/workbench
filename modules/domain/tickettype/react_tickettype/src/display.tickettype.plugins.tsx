import React from "react";
import { ActionPluginDetails } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { DisplaySelectKnowledgeArticleWorkbench, DisplaySelectKnowledgeArticleWorkbenchProps } from "./select.knowledge.article.workbench";
import { DisplayKnowledgeArticleWorkbench, DisplayKnowledgeArticleWorkbenchProps } from "./ka.workspace";


export const displaySelectKnowledgeArticlePlugin = <S, > ( props: <State, >( s: LensState<State, S, any> ) => DisplaySelectKnowledgeArticleWorkbenchProps<S> ): ActionPluginDetails<S, DisplaySelectKnowledgeArticleWorkbenchProps<S>> => ({
  by: "SelectKnowledgeArticleWorkbench",
  props,
  render: ( props ) => <DisplaySelectKnowledgeArticleWorkbench {...props} />
});

export const displayCreateKnowledgeArticlePlugin = <S, > ( props: <State, >( s: LensState<State, S, any> ) => DisplayKnowledgeArticleWorkbenchProps<S> ): ActionPluginDetails<S, DisplayKnowledgeArticleWorkbenchProps<S>> => ({
  by: "CreateKnowledgeArticleWorkbench",
  props,
  render: ( props ) => <DisplayKnowledgeArticleWorkbench {...props} />
});