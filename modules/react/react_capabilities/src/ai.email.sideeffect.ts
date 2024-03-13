import { ISideEffectProcessor, SideEffect } from "@itsmworkbench/react_core";
import { AIEmailsFn, EmailData, EmailResult } from "@itsmworkbench/ai_ticketvariables";
import { Optional, Transform } from "@focuson/lens";
import {  } from "./email.workbench";
import { EmailTempData } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";

//OK Gritting our teeth we aren't worrying about the errors for now. We are just going to assume that everything is going to work.
//This is so that we can test out the happy path of the gui. We want to see what it will look like. We will come back to the errors later.

export interface AiEmailSideEffect extends SideEffect, EmailData {
  command: 'aiEmail';
}
export function isAiEmailSideEffect ( x: any ): x is AiEmailSideEffect {
  return x.command === 'aiEmail'
}

export function addAiEmailSideEffectProcessor<S> ( ai: AIEmailsFn, emailDataL: Optional<S, Action> ): ISideEffectProcessor<S, AiEmailSideEffect, EmailResult> {
  return ({
    accept: ( s: SideEffect ): s is AiEmailSideEffect => isAiEmailSideEffect ( s ),
    process: async ( s: S, se: AiEmailSideEffect ) => {
      const actionL: Optional<S, any> = emailDataL as any
      const emailResult: EmailResult = await ai ( se )
      const txs: Transform<S, any>[] = [
        [ actionL, _ => ({}) ],// fixes bug when it doesn't exist. Really should be handled by the transform
        [ actionL.focusOn ( 'email' ), _ => emailResult?.email ],
        [ actionL.focusOn ( 'subject' ), _ => emailResult?.subject ]
      ]
      return { result: emailResult, txs }
    }
  })
}

