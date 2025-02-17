import React from "react";

export interface SimpleTableProps<T> {
    styles?: TableStyles;
    titles: string[];
    data: T[];
    keys: (keyof T)[];
    noDataText?: string;
    noWrap?: (keyof T)[];  // Columns that should NOT wrap
    onRowSelect?: (row: T, index: number) => void;
}

export type TableStyleKeys = 'header' | 'cell' | 'noWrapCell' | 'noData' | 'hoverRow';
export type TableStyles = Record<TableStyleKeys, React.CSSProperties>;
export type Table = (props: SimpleTableProps<any>) => React.ReactNode;

