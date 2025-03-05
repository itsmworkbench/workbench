import { AttributeValueLayout, AttributeValueLayoutProps } from "../attribute.value";
import React from "react";
export const SimpleAttributeValueLayout: AttributeValueLayout = (props: AttributeValueLayoutProps) => {
    const { children, orientation = 'horizontal', className } = props;

    // Convert children into an array to safely extract the first (label) and second (value) items.
    const childrenArray = React.Children.toArray(children);
    const label = childrenArray[0];
    const content = childrenArray[1];

    // For a horizontal layout, we use CSS Grid to create two columns:
    // one for the label (with a fixed or minimum width) and one for the content.
    const gridStyle: React.CSSProperties = orientation === 'horizontal' ? {
        display: 'grid',
        gridTemplateColumns: 'minmax(100px, 200px) auto',
        alignItems: 'center',
        width: '100%',
        gap: '0.5rem',
    } : {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        gap: '0.5rem',
    };

    return (
        <div
            className={className}
            data-testid={props['data-testid']}
            style={gridStyle}
        >
            <div>{label}</div>
            <div>{content}</div>
        </div>
    );
};
