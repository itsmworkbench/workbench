import React from "react";
import {DisplayBreadcrumb, DisplayBreadcrumbs, useWizardComponents} from "./wizard";

export const SimpleDisplayBreadcrumbs: DisplayBreadcrumbs =
    ({steps, stepOps}) => {
        const [currentStep, setCurrentStep] = stepOps; //an external shared 'useState'
        const {Breadcrumb} = useWizardComponents()
        const selectedIndex = steps.indexOf(currentStep)
        return <div aria-label="breadcrumb">
            {steps.map((step, index) => {
                const isCurrentStep = step === currentStep;
                const isClickable = index <= selectedIndex;
                const needsSeparator = index < steps.length - 1;
                return (
                    <><Breadcrumb stepOps={stepOps} step={step} clickable={isClickable}/>
                        {needsSeparator && <> &gt;&gt; </>}
                    </>
                );
            })}
        </div>
    }

export const SimpleDisplayBreadcrumb: DisplayBreadcrumb =
    ({step, stepOps, clickable}) => {
        const [currentStep, setCurrentStep] = stepOps; //an external shared 'useState'
        const isSelected = step === currentStep
        const onClick = clickable ? () => setCurrentStep(step) : undefined
        return <span style={{color: isSelected ? 'red' : 'black'}} onClick={onClick}>{step}</span>
    }