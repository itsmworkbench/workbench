import {WorkbenchPlugin} from 'modules/react2/workbenches/workbenches';
import React from 'react';
import {decorativeIconFn} from "@itsmworkbench/icons";

export const emailWorkbenchName = 'email';
export const emailWorkbenchPlugin: WorkbenchPlugin = ({
    plugin: 'workbench',
    name: emailWorkbenchName,
    icon: decorativeIconFn('email'),
    description: 'Allows the sending of emails',
    Display: () => <span>{emailWorkbenchName}</span>,
});