import React from "react";
import {WizardNextPrevFooter} from "./wizard";

export const SimpleWizardNextPrevFooter: WizardNextPrevFooter =
    ({steps, stepOps}) => {
        const [step, setStep] = stepOps;
        const index = steps.indexOf(step);
        const prevIndex = index - 1;
        const nextIndex = index + 1;
        return <div>
            <button onClick={() => setStep(steps[prevIndex])} disabled={prevIndex < 0}>Prev</button>
            <button onClick={() => setStep(steps[nextIndex])} disabled={nextIndex >= steps.length}>Next</button>
        </div>
    }