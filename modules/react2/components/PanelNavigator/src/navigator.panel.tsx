import React from "react";
import {NameAnd} from "@itsmworkbench/utils";
import {Icon, useIcon} from "@itsmworkbench/icons";
import {useTranslation} from "@itsmworkbench/translation";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {GetterSetter} from "@itsmworkbench/react_utils";

export type NavSize = 'small' | 'medium' | 'large'

export type OneNavigatorPanelProps = {
    name: string
    Icon?: Icon
    description: string
    size?: NavSize
    ops: GetterSetter<string>
    onSelected?: (name: string) => void
}
export type OneNavigatorPanel = (props: OneNavigatorPanelProps) => React.ReactNode
export type NavigatorPanelLayoutProps = { children: React.ReactNode, size?: NavSize }
export type NavigatorPanelLayout = (props: NavigatorPanelLayoutProps) => React.ReactNode;

export type CommonNavigatorPanelProps = {
    ops: GetterSetter<string>
    onSelected?: (name: string) => void
    size?: NavSize
}
export type NavigatorPanelProps = CommonNavigatorPanelProps & {
    panels: NavigatorPanelDefns;
}
export type NavigatorPanelPropsForStrings = CommonNavigatorPanelProps & {
    panels: string[]
    translatePrefix: string
}
export type NavigatorPanelDefns = NameAnd<NavigatorPanelDefn>
export type NavigatorPanelDefn = {
    icon: string
    descriptionKey: string
}

export function NavigatorPanelForStrings({panels, translatePrefix, ...rest}: NavigatorPanelPropsForStrings) {
    const translate = useTranslation()
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    return <NavPanelLayout size={rest.size}>
        {panels.map(name => {
            const description = rest.size==='small'?undefined:translate(`${translatePrefix}.${name}`);
            return <NavPanel key={name} name={name} description={description}  {...rest}/>
        })}
    </NavPanelLayout>;
}

export function NavigatorPanel({panels, ...rest}: NavigatorPanelProps) {
    const {DecorativeIcon} = useIcon();
    const translate = useTranslation()
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    return <NavPanelLayout size={rest.size}>
        {Object.entries(panels).map(([key, panel]) => {
            const Icon = DecorativeIcon(panel.icon);
            const description = translate(panel.descriptionKey);
            return <NavPanel key={key} name={key} description={description} Icon={Icon} {...rest}/>
        })}
    </NavPanelLayout>;
}

