import React from 'react';
import {makeSovereignStatePlugin} from '@itsmworkbench/sovereign';
import {GetterSetter} from '@itsmworkbench/react_utils';
import {useWorkbenchPlugins} from "@itsmworkbench/workbenches";
import {useCommonComponents} from "@itsmworkbench/common_components";

type WorkbenchsListProps = {
    selectedOps: GetterSetter<string | null>
}

export function WorkbenchesList({selectedOps}: WorkbenchsListProps) {
    const workbenchPanels = useWorkbenchPlugins()
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    return <NavPanelLayout size='small'>
        {Object.entries(workbenchPanels).map(([name, plugin]) => {
            const description = plugin.description || '';
            return <NavPanel key={name} name={name} description={description} Icon={plugin.icon} ops={selectedOps}  size='medium'/>;
        })}
    </NavPanelLayout>
}

export function WorkbenchesSovereignPane() {
    const selectedOps = React.useState<string | null>(null);
    const [selected] = selectedOps;
    const workbenchPanels = useWorkbenchPlugins()
    const plugin = workbenchPanels[selected];
    const {Display: Pane} = plugin || {};
    return <>
        <WorkbenchesList selectedOps={selectedOps}/>
        {Pane && <Pane/>}
    </>
}

export const WorkbenchesSovereignPagePlugin =
    makeSovereignStatePlugin(WorkbenchesSovereignPane);
