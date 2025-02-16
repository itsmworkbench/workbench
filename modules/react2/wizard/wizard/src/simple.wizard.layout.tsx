import React from "react";
import {useWizardComponents, WizardLayout} from "./wizard";

export const SimpleWizardLayout: WizardLayout = ({children, ...ops}) => {
    const {Breadcrumbs} = useWizardComponents();
    return <div>
        <Breadcrumbs{...ops}/>
        {children}
    </div>
}