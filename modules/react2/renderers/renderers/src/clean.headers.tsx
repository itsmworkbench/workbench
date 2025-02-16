import React from "react";

export const cleanForRender = (input: string) => {
    return input.trim().replace(/\n{3,}/g, '\n\n');
};

// CSS for heading overrides
export const allRenderStyle = `
    .clean-headers h1, 
    .clean-headers h2, 
    .clean-headers h3, 
    .clean-headers h4 {
        font-size: 1em;  /* Force all headings to the same size */
        line-height: 1.2;
        margin: 0.5em 0;
    }

    .clean-headers h1 {
        font-weight: 700;
    }

    .clean-headers h2 {
        font-style: italic;
    }

    .clean-headers h3 {
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .clean-headers h4 {
        text-decoration: underline;
    }
    .clean-headers p {
        margin: 0.5em 0;
    }
`;

export function CleanHeaders({ children }: { children: React.ReactNode }) {
    return (
        <div className="clean-headers">
            <style>{allRenderStyle}</style>
            {children}
        </div>
    );
}
