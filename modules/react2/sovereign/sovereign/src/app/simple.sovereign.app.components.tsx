// Layout Styles
import {SovereignAppComponents, SovereignAppLayout} from "./sovereign.app.components";
import {SimpleSovereignHeader} from "./simpleSovereignHeader";
import {SimpleSovereignFooter} from "./simpleSovereignFooter";
import React from "react";


const sovereignLayoutStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flexGrow: 1, // This ensures wizard.layout can take remaining space
};

export const SimpleSovereignLayout: SovereignAppLayout =
    ({children}) =>
        <div data-testi='sovereign.layout' style={sovereignLayoutStyle}>{children}</div>

export const SimpleSovereignAppComponents: SovereignAppComponents = ({
    SovereignAppLayout: SimpleSovereignLayout,
    SovereignHeader: SimpleSovereignHeader,
    SovereignFooter: SimpleSovereignFooter
})
