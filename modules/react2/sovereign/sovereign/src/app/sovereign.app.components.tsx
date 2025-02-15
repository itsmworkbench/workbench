import {ReactNode} from "react";
import {makeContextFor} from "@itsmworkbench/react_utils";

export type SovereignAppLayoutProps = {
    /* Header, Sovereign, and Footer */
    children: [ReactNode, ReactNode, ReactNode]
}
export type SovereignAppLayout = (props: SovereignAppLayoutProps) => ReactNode

export type SovereignHeaderProps = {}
export type SovereignHeader = (props: SovereignHeaderProps) => ReactNode
export type SovereignFooterProps = {}
export type SovereignFooter = (props: SovereignFooterProps) => ReactNode

export type SovereignAppComponents = {
    SovereignAppLayout: SovereignAppLayout,
    SovereignHeader: SovereignHeader,
    SovereignFooter: SovereignFooter
}

export const {use: useSovereignAppComponents, Provider: SovereignAppComponentsProvider} = makeContextFor<SovereignAppComponents, 'sovereignAppComponents'>('sovereignAppComponents');