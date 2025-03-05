
import {SimpleAttributeValueLayout, useAttributeValueOrientation} from "@itsmworkbench/renderers";
import { useTranslation } from "@itsmworkbench/translation";
import { camelCaseToWords } from "@itsmworkbench/utils";
import { makeGetterSetterFrom } from "@itsmworkbench/react_utils";
import React from "react";
import {EditComponentProps} from "./simpleEditComponents";

export function SimpleEditBoolean<Main>(props: EditComponentProps<Main, boolean>) {
    const { showLabel, fieldName, fieldDefn, rootId, mainOps, prefix } = props;
    const { editable, fieldType, lens } = fieldDefn;
    const orientation = useAttributeValueOrientation();
    const translation = useTranslation();
    const text = prefix ? translation(`${prefix}.${fieldName}`) : camelCaseToWords(fieldName);

    if (editable===false) {
        throw new Error(`Field ${fieldType} is not editable`);
    }

    const [value, setValue] = makeGetterSetterFrom(mainOps, lens);

    return (
        <SimpleAttributeValueLayout orientation={orientation}>
            {showLabel && (
                <label htmlFor={rootId} className="simple-boolean-editor-label">
                    {text}
                </label>
            )}
            <input
                data-testid={rootId}
                id={rootId}
                type="checkbox"
                checked={value}
                onChange={(e) => setValue(e.target.checked)}
                aria-label={!showLabel ? text : undefined}
                className="simple-boolean-editor-input"
            />
        </SimpleAttributeValueLayout>
    );
}
