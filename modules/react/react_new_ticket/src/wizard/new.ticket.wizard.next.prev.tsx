import { LensProps } from "@focuson/state";
import { getCurrentStep, getNextWizardStep, getPreviousWizardStep, NewTicketWizardStep } from "./new.ticket.wizard.domain";
import Button from "@mui/material/Button";
import React from "react";

export function NextNewWizardStepButton<S> ( { state, enabled }: LensProps<S, NewTicketWizardStep, any> & { enabled: boolean } ) {
  const currentStep = getCurrentStep ( state );
  const nextStep = getNextWizardStep ( currentStep );
  return (
    <Button
      disabled={!enabled && nextStep === undefined}
      variant="contained"
      onClick={() => {if ( nextStep ) state.setJson ( nextStep, 'wizard' )}}
    >
      Next
    </Button>
  );
}
export function PreviousNewWizardStepButton<S> ( { state }: LensProps<S, NewTicketWizardStep, any> ) {
  const currentStep = getCurrentStep ( state );
  const previousStep = getPreviousWizardStep ( currentStep );
  return (
    <Button
      disabled={previousStep === undefined}
      variant="contained"
      onClick={() =>{if(previousStep) state.setJson ( previousStep, 'wizard' )}}
    >
      Previous
    </Button>
  );

}