import React from "react";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { DisplaySelectKnowledgeArticleWorkbench, DisplaySelectKnowledgeArticleWorkbenchProps } from "./select.knowledge.article.workbench";
import { DisplayKnowledgeArticleWorkbench, DisplayKnowledgeArticleWorkbenchProps } from "./ka.workspace";


export const displaySelectKnowledgeArticlePlugin = <S, State> (): ActionPlugIn<S, State, DisplaySelectKnowledgeArticleWorkbenchProps<S>> =>
  ( props: ( s: LensState<S, State, any> ) => DisplaySelectKnowledgeArticleWorkbenchProps<S> ): ActionPluginDetails<S, State, DisplaySelectKnowledgeArticleWorkbenchProps<S>> => ({
    by: "SelectKnowledgeArticleWorkbench",
    props,
    render: ( s, props ) => <DisplaySelectKnowledgeArticleWorkbench {...props} />
  });

export const displayCreateKnowledgeArticlePlugin = <S, State> (): ActionPlugIn<S, State, DisplayKnowledgeArticleWorkbenchProps<S>> =>
  ( props: ( s: LensState<S, State, any> ) => DisplayKnowledgeArticleWorkbenchProps<S> ): ActionPluginDetails<S, State, DisplayKnowledgeArticleWorkbenchProps<S>> => ({
    by: "CreateKnowledgeArticleWorkbench",
    props,
    render: ( s, props ) => <DisplayKnowledgeArticleWorkbench {...props} />
  });