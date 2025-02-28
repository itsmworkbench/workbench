import React, {useMemo, useState} from "react";
import {ViewObjectFromDefn} from "@itsmworkbench/viewobject";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {PhaseName, PhaseStatus} from "@itsmworkbench/domain";
import {KnowledgeArticle, phaseStatusObjectDefn} from "@itsmworkbench/knowledgearticle";

export type DisplayKnowledgeArticleStatusProps = {
    ka: KnowledgeArticle
    status: PhaseStatus
    onClick?: (phase: string, action: string) => void
}
export type DisplayKnowledgeArticleStatus = (props: DisplayKnowledgeArticleStatusProps) => React.ReactElement

export type DisplayPhaseProps = DisplayKnowledgeArticleStatusProps & {
    phaseName: PhaseName
}


export function DisplayPhase(props: DisplayPhaseProps) {
    const {status, phaseName, ka, onClick} = props

    const phaseStatus = status[phaseName]
    const objectDefn = useMemo(() => phaseStatusObjectDefn(ka, phaseName), [phaseStatus, phaseName, ka])
    return <>
        <ViewObjectFromDefn
            rootId={phaseName}
            title={`knowledgeArticle.phase.${phaseName}.title`}
            showLabel={true}
            onClick={(fieldName) => onClick?.(phaseName, fieldName)}
            main={phaseStatus} objectDefn={objectDefn}/></>
}

export function DisplayKnowledgeArticleStatus(props: DisplayKnowledgeArticleStatusProps) {
    const {PanelWithWidth, PanelsInARow} = useCommonComponents()
    return <PanelsInARow width={220} panel={PanelWithWidth}>{
        Object.keys(props.ka.actions).map((phaseName) =>
            <DisplayPhase {...props} phaseName={phaseName as PhaseName}/>
        )
    }</PanelsInARow>
}

export type DisplayPhaseDetailsProps = {
    ka: KnowledgeArticle
    phaseName: PhaseName
    action: string

}

export function DisplayPhaseAction(props: DisplayPhaseDetailsProps) {
    const {ka, phaseName, action} = props
    const actionDetails = ka.actions?.[phaseName]?.[action]
    return <pre>{JSON.stringify(actionDetails, null, 2)}</pre>


}