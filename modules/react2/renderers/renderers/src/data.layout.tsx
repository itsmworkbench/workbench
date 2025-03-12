import {ReactNode} from "react";

export type DataLayoutProps = {
    rootId: string
    layout?: number[];  // Array specifying the number of items per row
    children: ReactNode;
    className?: string;
}
export type DataLayout = (props: DataLayoutProps) => ReactNode
