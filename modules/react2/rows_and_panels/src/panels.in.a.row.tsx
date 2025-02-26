import React, {ReactNode, CSSProperties, Children, useMemo} from "react";
import {PanelWithWidth} from "./panel.with.width";

export type PanelsInARowProps = {
    width: number;
    panel: PanelWithWidth;
    children: ReactNode;
    style?: CSSProperties;
};

export type PanelsInARow = (props: PanelsInARowProps) => ReactNode;

const defaultRowStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",      // This allows panels to wrap to the next row
    alignItems: "stretch", // Ensures all panels have the same height
    boxSizing: "border-box",
};
export const SimplePanelsInARow: PanelsInARow = ({
                                                     width,
                                                     panel: Panel,
                                                     children,
                                                     style = {},
                                                 }: PanelsInARowProps) => {
    const containerStyle = useMemo(() => ({...defaultRowStyle, ...style}), [style]);
    const panels = Children.map(children, (child) => {
        return <Panel width={width}>{child}</Panel>;
    });

    return <div style={containerStyle}>{panels}</div>;
};
