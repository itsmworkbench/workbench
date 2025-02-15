import React, {ChangeEvent} from "react";
import {devModeStyles} from "./dev.mode.styles";
import {useDebugState} from "@itsmworkbench/react_utils";
import {useAttributeValueComponents} from "@itsmworkbench/renderers";


export function DevModeDebug() {
    const [debug, setDebug] = useDebugState();
    const {Json}=useAttributeValueComponents();
    const {containerStyle, headingStyle, checkboxContainerStyle, labelStyle, checkboxStyle, debugInfoStyle} = devModeStyles;
    const handleCheckboxChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
        setDebug({...debug, [key]: e.target.checked});
    };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>Debug</h2>
            {Object.keys(debug).map((key) => (
                <div key={key} style={checkboxContainerStyle}>
                    <label style={labelStyle}>
                        <input
                            type="checkbox"
                            checked={debug[key]}
                            onChange={handleCheckboxChange(key)}
                            style={checkboxStyle}
                        />
                        {key}
                    </label>
                </div>
            ))}
            <div style={debugInfoStyle}>
                <Json rootId='debug' attribute='debug' value={debug}/>
            </div>
        </div>
    );
}
