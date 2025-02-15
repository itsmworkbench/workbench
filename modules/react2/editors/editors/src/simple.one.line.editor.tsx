import {Editor, EditorProps} from "./editors";
import React from "react";
import {idFrom} from "@itsmworkbench/renderers";

export const SimpleOneLineEditor: Editor = ({rootId, attribute, ops}: EditorProps<string>) => {
    const [value, setValue] = ops
    const dataTestid = idFrom(rootId, attribute);
    return (
        <input
            data-testid={dataTestid}
            id={dataTestid}
            value={value}
            onChange={e => setValue(e.target.value)}
        />
    );
};