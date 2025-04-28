import {WorkbenchPlugin} from '@itsmworkbench/workbenches';
import React from 'react';
import {decorativeIconFn, DecorativeIconFn} from "@itsmworkbench/icons";

export const sqlWorkbenchName = 'sql';
export const sqlWorkbenchPlugin: WorkbenchPlugin = ({
    plugin: 'workbench',
    name: sqlWorkbenchName,
    icon: decorativeIconFn('sql'),
    description: 'Allows the execution of SQL queries',
    Display: () => <span>{sqlWorkbenchName}</span>,
});