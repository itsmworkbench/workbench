import React from 'react';
import {decorativeIconFn} from "@itsmworkbench/icons";
import {WorkbenchPlugin} from "@itsmworkbench/workbenches";
import {EmailWorkbench} from "./components/email.workbench.component";

export const emailWorkbenchName = 'email';

export type EmailWorkbenchData = {
    purpose: string
    to: string;
    subject: string;
    body: string;
}

export const emailWorkbenchPlugin: WorkbenchPlugin<EmailWorkbenchData> = ({
    plugin: 'workbench',
    name: emailWorkbenchName,
    icon: decorativeIconFn('email', {size: 'small'}),
    description: 'Allows the sending of emails',
    empty: {body:'', subject:'', to:'', purpose:''},
    Display: EmailWorkbench
});