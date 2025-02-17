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
export type NavigatorPanelLayout = (props: { children: React.ReactNode }) => React.ReactNode;

export interface NavigatorPanelProps {
    panels: NavigatorPanelDefns;
    ops: GetterSetter<string>
    onSelected?: (name: string) => void
    size?: NavSize
}

export type NavigatorPanelDefns = NameAnd<NavigatorPanelDefn>
export type NavigatorPanelDefn = {
    icon: string
    descriptionKey: string
}

export function NavigatorPanel({panels, ...rest}: NavigatorPanelProps) {
    const {DecorativeIcon} = useIcon();
    const translate = useTranslation()
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    return <NavPanelLayout>
        {Object.entries(panels).map(([key, panel]) => {
            const Icon = DecorativeIcon(panel.icon);
            const description = translate(panel.descriptionKey);
            return <NavPanel key={key} name={key} description={description} Icon={Icon} {...rest}/>
        })}
    </NavPanelLayout>;
}

