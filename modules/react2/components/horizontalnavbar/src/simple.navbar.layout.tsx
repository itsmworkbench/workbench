import React, {CSSProperties} from "react";
import {toCamelCase} from "@itsmworkbench/utils";
import {NavBarLayout} from "./horizontal.nav.bar";


export const defaultNavBarLayoutStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    gap: '1rem',
    flexWrap: 'wrap', // Allow items to wrap on smaller screens

}
export const SimpleNavbarLayout = (purpose: string, style: CSSProperties = defaultNavBarLayoutStyle): NavBarLayout =>
    ({children}) => {
        return (
            <nav
                role="navigation"
                aria-label={purpose}
                className={toCamelCase(purpose)}
                style={style}
            >{children}
            </nav>
        );
    };