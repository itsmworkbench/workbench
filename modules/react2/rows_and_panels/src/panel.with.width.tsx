import React, { useMemo } from "react";
import {ReactNode, CSSProperties} from "react";

export type PanelWithWidthProps = {
    children: ReactNode;
    width: number;
    style?: CSSProperties;
};
export type PanelWithWidth = (props: PanelWithWidthProps) => ReactNode;

const defaultStyle: CSSProperties = {
    border: "1px solid black",
    padding: "8px",
    boxSizing: "border-box",
}
export const SimplePanelWithWidth = ({ children, width, style = {} }) => {
    const combinedStyle = useMemo(() => ({ ...defaultStyle, ...style, width }), [style, width]);
    return <div style={combinedStyle}>{children}</div>;
};
