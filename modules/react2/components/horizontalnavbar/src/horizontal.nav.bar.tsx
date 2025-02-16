import React, {ReactNode} from "react";
import {GetterSetter} from "@itsmworkbench/react_utils";
import {useCommonComponents} from "@itsmworkbench/common_components";

export type NavBarItemProps = { value: string, selectedOps: GetterSetter<string>, sideEffectOnSelect?: (value: string) => void }
export type NavBarItem = (props: NavBarItemProps) => React.ReactElement;
/**The prefix is for translation purposes. The key will be `${prefix}.${value}` */
export type NavBarItemFn = (prefix: string) => NavBarItem;
export type NavbarLayoutProps = { children: React.ReactNode }
export type NavBarLayout = (props: NavbarLayoutProps) => ReactNode;
export type NavBarProps = { selectedOps: GetterSetter<string>, sideEffectOnSelect?: (value: string) => void }
export type NavBar = (props: NavBarProps) => React.ReactElement;


export const HorizontalNavBar = (prefix: string, items: string[]): NavBar => ({selectedOps}) => {
    const NavBarLayout = useDataViewNavBarLayout()
    const {SelectableButton} = useCommonComponents()
    return <NavBarLayout>
        {items.map(item => <SelectableButton key={item} prefix={prefix} selectedOps={selectedOps} text={item}/>)}
    </NavBarLayout>
}


