import {DataLayout, DataLayoutProps} from "../data.layout";
import React, {ReactNode} from "react";
import {useTheme} from "@itsmworkbench/themes";
import {useCommonComponents} from "@itsmworkbench/common_components";

export const SimpleDataLayout: DataLayout = ({rootId, layout, children, className}: DataLayoutProps) => {
    const theme = useTheme();
    const {dataLayout: styles} = theme;
    const rows: ReactNode[][] = [];
    let childIndex = 0;

    const childrenArray = React.Children.toArray(children);

    // Create rows based on layout array
    for (const itemsInRow of layout) {
        const row = childrenArray.slice(childIndex, childIndex + itemsInRow);
        if (row.length > 0) {
            rows.push(row);
        }
        childIndex += itemsInRow;
    }
    const {BgMouseOver} = useCommonComponents();
    return (
        <BgMouseOver bgHover={"var(--bg-hover-color)"}>
            <div
                data-testid={`${rootId}-data-layout`}
                className={className || "layout-container"}
                role="presentation" // Suppresses unwanted semantics
                style={styles.dataLayoutContainer}
            >
                {rows.map((row, rowIndex) => (
                    <div className="simple_data_rows" key={rowIndex} role="row" style={{...styles.dataLayoutRow, ...(row.length > 1 ? {display: "flex"} : null)}}>
                        {row.map((child, colIndex) => (<>{child && (
                                <div key={colIndex} role="cell" style={{...styles.dataLayoutItem, marginTop: "4px"}}>{child}</div>
                            )}</>
                        ))}
                    </div>
                ))}
            </div>
        </BgMouseOver>
    );
};
