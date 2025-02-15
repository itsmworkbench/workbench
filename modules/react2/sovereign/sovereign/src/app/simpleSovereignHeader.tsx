import {SovereignHeader} from "./sovereign.app.components";
import {useLoginComponents} from "@itsmworkbench/react_login_component";
import {useIcon} from "@itsmworkbench/icons";
import {useTranslation} from "@itsmworkbench/translation";
import React, {ReactNode} from "react";

const headerLayoutStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #ddd',
};
export type SimpleHeaderLayoutProps = {
    children: [ReactNode, ReactNode];
};

// Layout Component
export function SimpleHeaderLayout({children}: SimpleHeaderLayoutProps) {
    return <div style={headerLayoutStyles}>{children}</div>;
}


// Header Implementation
export const SimpleSovereignHeader: SovereignHeader = ({}) => {
    const {DisplayLogin} = useLoginComponents();
    const {MeaningfulIcon} = useIcon();
    const translate = useTranslation();
    const HomeIcon = MeaningfulIcon('home', 'icon.homepage');
    return (
        <SimpleHeaderLayout>
            <a href='/' title={translate('header.home')}>
                <HomeIcon/>
            </a>
            <DisplayLogin/>
        </SimpleHeaderLayout>
    );
};