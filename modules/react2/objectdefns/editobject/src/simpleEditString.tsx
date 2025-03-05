import {SimpleAttributeValueLayout, useAttributeValueOrientation} from "@itsmworkbench/renderers";
import {useTranslation} from "@itsmworkbench/translation";
import {camelCaseToWords} from "@itsmworkbench/utils";
import {makeGetterSetterFrom} from "@itsmworkbench/react_utils";
import React, {CSSProperties} from "react";
import {EditComponentProps} from "./simpleEditComponents";
import {useTheme} from "@itsmworkbench/themes";

export function SimpleEditString<Main>(props: EditComponentProps<Main, string>) {
    const {showLabel, fieldName, fieldDefn, rootId, mainOps, prefix} = props;
    const {editable, fieldType, lens} = fieldDefn;
    const orientation = useAttributeValueOrientation();
    const translation = useTranslation();
    const text = prefix ? translation(`${prefix}.${fieldName}`) : camelCaseToWords(fieldName);
    if (editable === false) throw new Error(`Field ${fieldType} is not editable`);
    const [value, setValue] = makeGetterSetterFrom<Main, string>(mainOps, lens);
    return (
        <SimpleAttributeValueLayout orientation={orientation}>
            {showLabel && (
                <label htmlFor={rootId} className="simple-edit-string-label">
                    {text}
                </label>
            )}
            <input
                data-testid={rootId}
                id={rootId}
                type="text"
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                aria-label={!showLabel ? text : undefined}
                className="simple-edit-string-input"
            />
        </SimpleAttributeValueLayout>
    );
}