import React from 'react';
import {useTheme} from "@itsmworkbench/themes";

interface ClipboardButtonProps {
    text: string;
}

export type ClipboardButton = (props: ClipboardButtonProps) => React.ReactElement;

export const SimpleClipboardButton: ClipboardButton = ({text}) => {
    const theme = useTheme()
    const style = theme.buttonStyles.icon || {}
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy text: ', error);
        }
    };
    //button with no border
    return <button style={style} onClick={handleCopy}>📋</button>;
};
