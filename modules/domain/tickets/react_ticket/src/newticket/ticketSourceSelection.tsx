import { LensProps2 } from "@focuson/state";
import { getCurrentStep, getNextWizardStep, NewTicketWizardStep, TicketSourceMethod, ticketSourceMethods } from "./new.ticket.wizard.domain";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { splitAndCapitalize } from "@itsmworkbench/utils";
import React from "react";

const supported: TicketSourceMethod[] = ['manually'];
export function TicketSourceSelection<S> ( { state }: LensProps2<S, NewTicketWizardStep, TicketSourceMethod, any> ) {
  const currentStep = getCurrentStep ( state.state1 () );
  const nextStep = getNextWizardStep ( currentStep );
  if ( nextStep === undefined ) throw Error ( 'No next step' );
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <Typography variant="h6" gutterBottom>
          How would you like to enter the ticket details?
        </Typography>
        <Typography variant="body1" gutterBottom>
          At the moment you can only create a ticket manually. This involves typing in the ticket details yourself. We will be adding support for other ticket sources soon.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6} container direction="column" alignItems="center" spacing={2}>
        {ticketSourceMethods.map(method => (
          <Grid item key={method}>
            <Button
              variant="contained"
              disabled = {!supported.includes(method)}
              sx={{
                minWidth: '250px',
                height: '50px',
                fontSize: '16px',
                textTransform: 'none', // Prevents uppercase transformation for button text
              }}
              onClick={() => state.setJson(nextStep, method, '')}
            >
              {splitAndCapitalize(method)}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Grid>

  );
}