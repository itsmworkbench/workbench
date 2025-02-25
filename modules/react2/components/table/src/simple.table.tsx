import React, {useState} from "react";
import {SimpleTableProps, Table, TableStyles} from "./table";

export const defaultTableStyles: TableStyles = {
    header: {
        border: "1px solid #ddd",
        padding: "12px",
        textAlign: "left",
        backgroundColor: "#f4f4f4",
        fontWeight: "bold",
    },
    cell: {
        border: "1px solid #ddd",
        padding: "12px",
        whiteSpace: "normal", // Allow wrapping by default
    },
    noWrapCell: {
        whiteSpace: "nowrap", // Prevent wrapping if specified
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    noData: {
        textAlign: "center",
        padding: "24px",
        fontStyle: "italic",
        color: "#777",
    },
    hoverRow: {
        cursor: "pointer",
    },
};

export const SimpleTable: Table = <T, >({
                                            styles = defaultTableStyles,
                                            titles,
                                            data,
                                            keys,
                                            noDataText = "No data available",
                                            noWrap = [],
                                            selectedRowOps,
                                            onRowSelect,
                                        }: SimpleTableProps<T>) => {
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const getRowBackground = (rowIndex: number): string => {
        if (!selectedRowOps) return;
        if (rowIndex === selectedRowOps[0]) {
            return "#d1e7fd"; // Highlight color for selected row
        }
        if (rowIndex === hoveredRow) {
            return "#f0f0f0"; // Hover effect color
        }
        return rowIndex % 2 === 0 ? "#f9f9f9" : "#ffffff";
    };

    return (
        <div style={{overflowX: "auto"}}>
            <table style={{width: "100%", borderCollapse: "collapse"}}>
                <thead>
                <tr>
                    {titles.map((title, index) => (
                        <th key={index} style={styles.header}>
                            {title}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={titles.length} style={styles.noData}>
                            {noDataText}
                        </td>
                    </tr>
                ) : (
                    data.map((item, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => {
                                selectedRowOps?.[1]?.(rowIndex);
                                onRowSelect?.(item, rowIndex);
                            }}
                            onMouseEnter={() => setHoveredRow(rowIndex)}
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{
                                ...styles.hoverRow,
                                backgroundColor: getRowBackground(rowIndex),
                            }}
                        >
                            {keys.map((key, colIndex) => (
                                <td
                                    key={colIndex}
                                    style={{
                                        ...styles.cell,
                                        ...(noWrap.includes(key) ? styles.noWrapCell : {}),
                                    }}
                                >
                                    {item[key] as React.ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};
