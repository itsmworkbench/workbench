import {useTheme} from "@itsmworkbench/themes";
import React from "react";
import {OnePhaseDisplay, PhaseDisplayLayout, PhaseTc, PhaseTcDisplays} from "./phase.progress";


export const SimplePhaseDisplay: OnePhaseDisplay = ({name, phase}) => {
    const {phaseStyles} = useTheme();
    const {basePhaseStyle, statusToStyle} = phaseStyles;
    return <div data-testid={`phase-status-${name}`} style={basePhaseStyle}>
        {Object.entries(phase).map(([subName, subStatus]) => {
            const subStyle = {...basePhaseStyle, ...statusToStyle[subStatus]};
            return <div key={subName} data-testid={`phase-substatus-${subName}`} style={subStyle}>
                {`${subName}: ${subStatus}`}
            </div>;
        })}
    </div>
};
export const SimplePhaseLayout: PhaseDisplayLayout = ({children}) => {
    const {phaseStyles} = useTheme()
    const {layout} = phaseStyles
    return <div style={layout}>{children}</div>
}
export const SimpleArrowIcon = () =>
    <span style={{margin: '0 8px', fontSize: '1.2em', fontWeight: 'bold'}}>&rarr;</span>;

export function simplePhaseDisplays<T, >(): PhaseTcDisplays<T> {
    return {
        PhaseDisplay: SimplePhaseDisplay,
        PhaseDisplayLayout: SimplePhaseLayout,
        ArrowIcon: SimpleArrowIcon
    };
}