import React, { CSSProperties, ReactNode } from "react";

interface ClipHeightProps {
    children: ReactNode;
    maxHeight: string;  // e.g., "200px", "50vh"
    scrollable?: boolean;
    force?: boolean;  // Force height if true
}

export const ClipHeight: React.FC<ClipHeightProps> = ({ children, maxHeight, scrollable = false, force = false }) => {
    const containerStyle: CSSProperties = {
        maxHeight,  // Applies maxHeight normally
        overflowY: scrollable ? 'auto' : 'hidden',
        height: force ? maxHeight : 'auto',  // Force exact height when 'force' is true
    };

    return (
        <div style={containerStyle}>
            {children}
        </div>
    );
};

