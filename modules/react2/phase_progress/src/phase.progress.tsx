import {LensAndPath} from "@itsmworkbench/optics";
import {NameAnd} from "@itsmworkbench/utils";
import React, {ReactElement} from "react";

export type PhaseStatus = 'waiting' | 'in-progress' | 'completed' | 'failed'

export type PhaseItem = NameAnd<PhaseStatus>

export type OnePhaseDisplayProps = {
    name: string
    phase: PhaseItem
}
export type OnePhaseDisplay = (props: OnePhaseDisplayProps) => ReactElement

export type PhaseDisplayLayoutProps = {
    children: React.ReactNode
}
export type PhaseDisplayLayout = (props: PhaseDisplayLayoutProps) => ReactElement

export type PhaseTcDisplays<T> = {
    ArrowIcon: () => ReactElement
    PhaseDisplay: OnePhaseDisplay
    PhaseDisplayLayout: PhaseDisplayLayout
}
export type PhaseTc<T> =  PhaseTcDisplays<T> &{
    phases(t: T): string[]
    lens(phase: string): LensAndPath<T, PhaseItem>
}

export type ProgressDisplayProps<T> = {
    data: T;
    phaseTc: PhaseTc<T>;
};

export const ProgressDisplay = <T, >({data, phaseTc}: ProgressDisplayProps<T>) => {
    const phaseNames = phaseTc.phases(data);
    const {lens, PhaseDisplay, ArrowIcon, PhaseDisplayLayout} = phaseTc
    return <PhaseDisplayLayout>{
        phaseNames.map((phaseName, index) =>
            <React.Fragment key={phaseName}>
                <PhaseDisplay name={phaseName} phase={lens(phaseName)?.get(data)}/>
                {index < phaseNames.length - 1 && <ArrowIcon/>}
            </React.Fragment>)}</PhaseDisplayLayout>;
};

