import { LensProps } from "@focuson/state";
import { getCurrentStep, isSameOrBefore, NewTicketWizardStep, newTicketWizardSteps } from "./new.ticket.wizard.domain";
import { Breadcrumbs, Link } from "@mui/material";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import React from "react";

export function WizardBreadcrumbs<S> ( { state }: LensProps<S, NewTicketWizardStep, any> ) {
  const currentStep = getCurrentStep ( state )

  return <Breadcrumbs aria-label="breadcrumb">
    {newTicketWizardSteps.map ( ( step, index ) => {
      const isCurrentStep = step === currentStep;
      const isClickable = isSameOrBefore ( currentStep, step );

      return (
        <Link
          key={step}
          color={isCurrentStep ? "textPrimary" : "inherit"}
          onClick={() => isClickable && state.setJson ( step, 'wizard' )}
          style={{ cursor: isClickable ? 'pointer' : 'default', fontWeight: isCurrentStep ? 'bold' : 'normal', textDecoration: isClickable ? 'underline' : 'none' }}
          component="button"
          disabled={!isClickable}
        >
          {splitAndCapitalize ( step )}
        </Link>
      );
    } )}
  </Breadcrumbs>
}