import React from 'react';
import {decorativeIconFn} from "@itsmworkbench/icons";
import {WorkbenchPlugin} from "@itsmworkbench/workbenches";
import {EmailWorkbench} from "./components/email.workbench.component";

export const emailWorkbenchName = 'email';
export const emailWorkbenchPlugin: WorkbenchPlugin = ({
    plugin: 'workbench',
    name: emailWorkbenchName,
    icon: decorativeIconFn('email', {size: 'small'}),
    description: 'Allows the sending of emails',
    Display: () => <EmailWorkbench/>,
});