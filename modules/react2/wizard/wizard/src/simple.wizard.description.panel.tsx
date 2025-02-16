import React from "react";
import {useWizardComponents, WizardPanel} from "./wizard";
import {camelCaseToWords} from "@itsmworkbench/utils";

export function SimpleWizardDescriptionPanel<T>(): WizardPanel<T> {
    return ({name, description, steps, stepOps}) => {
        const {NextPrevFooter} = useWizardComponents()
        const niceName = camelCaseToWords(name)
        return <div>
            <h2>{niceName}</h2>
            <p>{description}</p>
            <NextPrevFooter steps={steps} stepOps={stepOps}/>
        </div>

    }
}