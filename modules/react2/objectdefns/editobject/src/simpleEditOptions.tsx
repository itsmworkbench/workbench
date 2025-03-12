import {labelText, SimpleAttributeValueLayout, useAttributeValueOrientation} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {camelCaseToWords} from "@itsmworkbench/utils";
import {makeGetterSetterFrom} from "@itsmworkbench/react_utils";
import React from "react";
import {EditComponentWithOptionsProps} from "./simpleEditComponents";

export function SimpleEditOptions<Main>(props: EditComponentWithOptionsProps<Main, string>) {
    const {showLabel, fieldName, fieldDefn, rootId, mainOps, prefix, options} = props;
    const {editable, fieldType, lens} = fieldDefn;
    const orientation = useAttributeValueOrientation();
    const translation = useTranslation();
    const text = prefix ? translation(`${prefix}.${fieldName}`) : camelCaseToWords(fieldName);

    if (editable === false) {
        throw new Error(`Field ${fieldType} is not editable`);
    }

    const [value, setValue] = makeGetterSetterFrom(mainOps, lens);

    return (
        <SimpleAttributeValueLayout orientation={orientation}>
            {showLabel && (
                <label htmlFor={rootId} className="simple-options-editor-string-label">
                    {labelText(translation, showLabel)(text)}
                </label>
            )}
            <select
                data-testid={rootId}
                id={rootId}
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                aria-label={!showLabel ? text : undefined}
                className="simple-options-editor-string-select"
            >
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </SimpleAttributeValueLayout>
    );
}
