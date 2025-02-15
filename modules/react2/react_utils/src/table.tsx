import React from "react";

export interface SimpleTableProps<T> {
    titles: string[];
    data: T[];
    keys: (keyof T)[];
    noDataText?: string;
    noWrap?: (keyof T)[];  // Columns that should NOT wrap
}

const styles: Record<string, React.CSSProperties> = {
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
        whiteSpace: "normal",  // Allow wrapping by default
    },
    noWrapCell: {
        whiteSpace: "nowrap",  // Prevent wrapping if specified
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

export const SimpleTable = <T,>({
                                    titles,
                                    data,
                                    keys,
                                    noDataText = "No data available",
                                    noWrap = [],
                                }: SimpleTableProps<T>) => {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                            style={{
                                backgroundColor: rowIndex % 2 ? "#ffffff" : "#f9f9f9",
                                ...styles.hoverRow,
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f0f0f0")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    rowIndex % 2 ? "#ffffff" : "#f9f9f9")
                            }
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
