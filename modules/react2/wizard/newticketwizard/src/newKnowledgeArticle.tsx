import React, {useState} from "react";
import {EditObjectFromDefn} from "@itsmworkbench/editobject";
import {defaultKnowledgeArticleDetails, detailsToKnowledgeArticle, KnowledgeArticleDetails, knowledgeArticleDetailsObjectDefn} from "@itsmworkbench/knowledgearticle";
import {KADetails} from "@itsmworkbench/reacturlstore";
import {GetterSetter} from "@itsmworkbench/react_utils";


export type NewKnowledgeArticleProps = {
    onNewKa: (kad: KADetails) => void
    kadOps: GetterSetter<KnowledgeArticleDetails>
}


export function NewKnowledgeArticle({onNewKa, kadOps}: NewKnowledgeArticleProps) {
    const [kad, setKad] = kadOps

    function makeKad(kad: KnowledgeArticleDetails): KADetails {

        const ka = detailsToKnowledgeArticle(kad)
        return {name: kad.name, descriptionOrError: ka.description, ka}
    }

    const valid = kad.name && kad.description
    return <>
        <div>New Knowledge Article</div>
        <EditObjectFromDefn showLabel={true} rootId='new-knowledge-article' mainOps={kadOps} objectDefn={knowledgeArticleDetailsObjectDefn}/>
        <button disabled={!valid} onClick={() => onNewKa(makeKad(kadOps[0]))}>Submit</button>
    </>
}