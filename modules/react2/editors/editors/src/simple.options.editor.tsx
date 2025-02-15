// simple.options.editor.tsx

import {EditorProps} from "./editors";
import React from "react";
import {useTranslation} from "@itsmworkbench/translation";
import {idFrom} from "@itsmworkbench/renderers";

export type OptionsProps<T> = EditorProps<T> & {
    options: T[];
    stringify?: (t: T, i: number) => string;
    selectLabel?: string; // the translation index of the select label
    showClear?: string; // the translation index of the clear button
};

export type OptionsEditor = (<T>(props: OptionsProps<T>) => React.ReactNode)

export const SimpleOptionsEditor: OptionsEditor = <T extends any>({
                                                                      rootId,
                                                                      ariaLabel,
                                                                      attribute,
                                                                      ops,
                                                                      options,
                                                                      stringify,
                                                                      selectLabel,
                                                                      showClear,
                                                                  }: OptionsProps<T>) => {
    const translate = useTranslation();
    const [value, setValue] = ops;

    // Stringify each option
    const values = options.map((o, i) => (stringify ? stringify(o, i) : String(o)));
    // Find the stringified value corresponding to the current value
    const valueOfSelect = values.find((o, i) => (stringify ? stringify(value, i) === o : String(value) === o)) || '';

    function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedValue = e.target.value;
        if (selectedValue === '') {
            // Clear option selected
            setValue(null as T);
            return;
        }
        const selectedIndex = values.findIndex(v => v === selectedValue);
        const newValue = selectedIndex >= 0 ? options[selectedIndex] : null;
        setValue(newValue as T);
    }

    const id = idFrom(rootId, attribute);

    const clearOptions = showClear ? (
        <>
            <option disabled key="divider">----</option>
            <option value="" aria-label="Clear" key="clear">
                {translate(showClear)}
            </option>
        </>
    ) : null;

    const selectLabelOption = selectLabel ? (
        <option value="" disabled key="select-label">
            {translate(selectLabel)}
        </option>
    ) : null;

    return (
        <select
            id={id}
            aria-label={ariaLabel}
            data-testid={id}
            value={valueOfSelect}
            onChange={onChange}
        >
            {selectLabelOption}
            {options.map((o, i) => (
                <option key={values[i]} value={values[i]}>
                    {values[i]}
                </option>
            ))}
            {clearOptions}
        </select>
    );
};
