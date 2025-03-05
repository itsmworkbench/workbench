import React, {CSSProperties} from "react";
import {useTheme} from "@itsmworkbench/themes";
import {idFrom, Render, RenderProps} from "../renderers";
import {useCommonComponents} from "@itsmworkbench/common_components";

// Explicitly use Render<string> to handle string or undefined values
export const SimpleTextRenderer: Render<string> = ({attribute, rootId, value, clipboard}: RenderProps<string>) => {
    const isEmpty = !value || value?.trim?.() === "";
    const id = idFrom(rootId, attribute);
    const styles: CSSProperties = useTheme().renderer.text;
    const {ClipboardButton} = useCommonComponents()
    return (
        <span
            id={id}
            data-testid={id}
            style={styles}
            aria-label={isEmpty ? "Not available" : undefined}
            aria-live="polite"
        >
          <span style={{ flexGrow: 1 }}>
                {isEmpty ? "" : value}
            </span>
            {clipboard && !isEmpty && <ClipboardButton text={value}/>}
        </span>
    );
};
