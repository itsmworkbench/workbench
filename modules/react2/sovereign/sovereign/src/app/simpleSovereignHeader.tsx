import {SovereignHeader} from "./sovereign.app.components";
import {useLoginComponents} from "@itsmworkbench/react_login_component";
import {useIcon} from "@itsmworkbench/icons";
import {useTranslation} from "@itsmworkbench/translation";
import React, {ReactNode} from "react";
import {useTheme} from "@itsmworkbench/themes";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useDevModeVisible} from "@itsmworkbench/devmode";
import {useSelectedSovereign} from "../sovereign.selection.state";


export type SimpleHeaderLayoutProps = {
    children: ReactNode;
};

// Layout Component
export function SimpleHeaderLayout({children}: SimpleHeaderLayoutProps) {
    const {navStyles} = useTheme()
    return <div style={navStyles.navHeader}>{children}</div>;
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
    const [sp, setSp] = useSelectedSovereign()
    return (
        <SimpleHeaderLayout>
            <a onClick={() => setSp('')} title={translate('header.home')}>
                <HomeIcon style={logoStyle}/>
            </a>
            {devModeVisible
                ? <SelectableButton prefix={'devMode'} onClick={() => setDevModeVisible('')} text={'hide'}/>
                : <SelectableButton prefix={'devMode'} onClick={() => setDevModeVisible('visible')} text={'show'}/>}
            <div>
                {/*<DisplayLogin/>*/}
                <Password/>
            </div>
        </SimpleHeaderLayout>
    );
};