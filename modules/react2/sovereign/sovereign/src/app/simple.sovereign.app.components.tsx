// Layout Styles
import {SovereignAppComponents, SovereignAppLayout} from "./sovereign.app.components";
import {SimpleSovereignHeader} from "./simpleSovereignHeader";
import {SimpleSovereignFooter} from "./simpleSovereignFooter";
import React from "react";

export const SimpleSovereignLayout: SovereignAppLayout =
    ({children}) =>
        <div>{children}</div>

export const SimpleSovereignAppComponents: SovereignAppComponents = {
    SovereignAppLayout: SimpleSovereignLayout,
    SovereignHeader: SimpleSovereignHeader,
    SovereignFooter: SimpleSovereignFooter
}
