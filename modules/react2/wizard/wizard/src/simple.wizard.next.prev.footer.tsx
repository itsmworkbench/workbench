import React from "react";
import {WizardNextPrevFooter, WizardNextPrevFooterProps} from "./wizard";

export function WizardPrevButton({steps, stepOps}: WizardNextPrevFooterProps) {
    const [step, setStep] = stepOps;
    const index = steps.indexOf(step);
    const prevIndex = index - 1;
    return <button onClick={() => setStep(steps[prevIndex])} disabled={prevIndex < 0}>Prev</button>
}

export function WizardNextButton({steps, stepOps}: WizardNextPrevFooterProps) {
    const [step, setStep] = stepOps;
    const index = steps.indexOf(step);
    const nextIndex = index + 1;
    return <button onClick={() => setStep(steps[nextIndex])} disabled={nextIndex >= steps.length}>Next</button>
}

export const SimpleWizardNextPrevFooter: WizardNextPrevFooter =
    ({steps, stepOps}) => {
        return <div>
            <WizardPrevButton steps={steps} stepOps={stepOps}/>
            <WizardNextButton steps={steps} stepOps={stepOps}/>
        </div>
    }