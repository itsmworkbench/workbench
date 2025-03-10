import React from "react";
import {cleanForRender, CleanHeaders, idFrom, Render, RenderProps} from "../../renderers";
import Markdown from 'markdown-to-jsx';
// Apply Render<string> to handle markdown rendering
export const MarkdownRenderer: Render<string> = ({ attribute, rootId, value }: RenderProps<string>) => {
    const id = idFrom(rootId, attribute);
    const cleaned = cleanForRender(value || "");
    return (
        <div id={id}>
            <CleanHeaders>
                <div data-testid={id}>
                    <Markdown>{cleaned}</Markdown>
                </div>
            </CleanHeaders>
        </div>
    );
};
