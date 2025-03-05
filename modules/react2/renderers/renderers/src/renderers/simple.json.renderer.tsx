import React from "react";
import {idFrom, Render} from "../renderers";
import {useCommonComponents} from "@itsmworkbench/common_components";

export const SimpleJsonRenderer: Render<any> = ({rootId, attribute, value, clipboard}) => {
    const id = idFrom(rootId, attribute);
    const {ClipboardButton} = useCommonComponents();
    const formattedValue = JSON.stringify(value, null, 2) || "null";

    return (<>
        <pre
            id={id}
            data-testid={id}
            aria-label="Formatted JSON"
            role="code"
            style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f5f5f5',
                color: '#000',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
            }}
        >
            {formattedValue}
        </pre>
            {clipboard && <ClipboardButton text={formattedValue}/>}</>
    );
};
