import {WorkbenchPlugin} from '@itsmworkbench/workbenches';
import React from 'react';
import {decorativeIconFn} from "@itsmworkbench/icons";

export const emailWorkbenchName = 'email';
export const emailWorkbenchPlugin: WorkbenchPlugin = ({
    plugin: 'workbench',
    name: emailWorkbenchName,
    icon: decorativeIconFn('email', {size: 'small'}),
    description: 'Allows the sending of emails',
    Display: () => <span>{emailWorkbenchName}</span>,
});