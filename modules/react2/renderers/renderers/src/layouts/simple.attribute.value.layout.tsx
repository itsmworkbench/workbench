import { AttributeValueLayout, AttributeValueLayoutProps } from "../attribute.value";
import React from "react";

export const SimpleAttributeValueLayout: AttributeValueLayout = (props: AttributeValueLayoutProps) => {
    const { children, orientation = 'horizontal', className } = props;

    return (
        <div
            className={className}
            data-testid={props['data-testid']}
            style={{
                // display: 'flex',
                flexDirection: orientation === 'horizontal' ? 'row' : 'column',
                gap: '0.5rem',  // Optional spacing between elements
            }}
        >
            {children}
        </div>
    );
};
