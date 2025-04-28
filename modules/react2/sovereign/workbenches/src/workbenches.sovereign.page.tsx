import React from 'react';
import { makeSovereignStatePlugin } from '@itsmworkbench/sovereign';
import { useWindowsPath, useWindowUrlData, windowUrlDataWithPart } from '@itsmworkbench/react_utils';
import { workbenchPanels } from './definitions/workbench.panels';

export function WorkbenchesSovereignPane() {
    const path = useWindowsPath();
    const selected = path[1];
    const [urlData, setUrlData] = useWindowUrlData();

    if (!selected) {
        return (
            <ul>
                {Object.keys(workbenchPanels).map(name => (
                    <li key={name}>
                        <a
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                const next = windowUrlDataWithPart(urlData, 1, name);
                                window.history.pushState({}, '', next.url);
                                setUrlData(next);
                            }}
                        >
                            {name}
                        </a>
                    </li>
                ))}
            </ul>
        );
    }

    const Pane = workbenchPanels[selected];
    if (Pane) return <Pane {...{}} />;

    return <div>Unknown Workbench: {selected}</div>;
}

export const WorkbenchesSovereignPagePlugin =
    makeSovereignStatePlugin(WorkbenchesSovereignPane);
