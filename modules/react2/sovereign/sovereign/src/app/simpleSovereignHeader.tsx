import {SovereignHeader, useSovereignAppComponents} from "./sovereign.app.components";
import {useLoginComponents} from "@itsmworkbench/react_login_component";
import {useIcon} from "@itsmworkbench/icons";
import {useTranslation} from "@itsmworkbench/translation";
import React, {ReactNode} from "react";
import {useTheme} from "@itsmworkbench/themes";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useDevModeState, useDevModeVisible} from "@itsmworkbench/devmode";

const headerLayoutStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #ddd',
};
export type SimpleHeaderLayoutProps = {
    children: ReactNode;
};

// Layout Component
export function SimpleHeaderLayout({children}: SimpleHeaderLayoutProps) {
    return <div style={headerLayoutStyles}>{children}</div>;
}


// Header Implementation
export const SimpleSovereignHeader: SovereignHeader = ({}) => {
    const {DisplayLogin} = useLoginComponents()
    const {SelectableButton, Password} = useCommonComponents();
    const [devModeVisible, setDevModeVisible] = useDevModeVisible()
    const {MeaningfulIcon} = useIcon();
    const translate = useTranslation();
    const {header} = useTheme()
    const {logoStyle, logoUrl} = header
    const HomeIcon = MeaningfulIcon(logoUrl, 'icon.homepage');
    return (
        <SimpleHeaderLayout>
            <a href='/' title={translate('header.home')}>
                <HomeIcon style={logoStyle}/>
            </a>
            {devModeVisible
                ? <SelectableButton prefix={'devMode'} onClick={() => setDevModeVisible('')} text={'hide'}/>
                : <SelectableButton prefix={'devMode'} onClick={() => setDevModeVisible('visible')} text={'show'}/>}
           <div>
            <DisplayLogin/>
            <Password/>
           </div>
        </SimpleHeaderLayout>
    );
};