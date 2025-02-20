import React from "react";
import {SelectableButton} from "./selectable.button";
import {useTranslation} from "@itsmworkbench/translation";


export const SimpleSelectableButton: SelectableButton =
    ({selectedOps, text, prefix, onClick}) => {
        const selected = selectedOps ? selectedOps[0] : '';
        const setSelected = selectedOps ? selectedOps[1] : () => {};
        const translate = useTranslation();
        const isSelected = selected === text;
        return (
            <button
                style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: isSelected ? '2px solid #007bff' : '1px solid #000', // Highlight border if selected
                    backgroundColor: isSelected ? '#007bff' : '#fff', // Blue background if selected
                    color: isSelected ? '#fff' : '#000', // White text if selected
                    cursor: 'pointer',
                    transition: 'background-color 0.3s, border-color 0.3s', // Smooth transitions for hover and selection
                }}
                onClick={() => {
                    setSelected(text);
                    onClick?.(text)
                }}
            >{translate(`${prefix}.${text}`)}</button>
        );
    };


