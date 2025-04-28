import { ReactElement } from "react";
import { NameAnd } from "@itsmworkbench/utils";

export type DisplayWorkbenchProps = {};

export type DisplayWorkbench = (props: DisplayWorkbenchProps) => ReactElement;

type WorkbenchPlugin = {
    plugin: 'workbench';
    /** For example email, sql, ldap */
    name: string;
    description?: string;
    Display: DisplayWorkbench;
};

type EmailType = {
    /** Missing data, approval, close ticket */
    purpose: string;
    promptForAi: string;
};

const sqlPlugin: WorkbenchPlugin = {
    plugin: 'workbench',
    name: 'sql',
    Display: () => <span>SQL</span>,
};

const emailPlugin = (emailPlugInParams: EmailPluginParams): WorkbenchPlugin => ({
    plugin: 'workbench',
    name: 'email',
    Display: () => <span>email</span>,
});

const emailTypes: NameAnd<EmailType> = {
    missingData: { purpose: 'missing data', promptForAi: 'Request more data' },
    approval: { purpose: 'approval', promptForAi: 'Request approval' },
    closeTicket: { purpose: 'close ticket', promptForAi: 'Close the ticket' },
};

// Used by the sovereign pane that displays the workbenches
const workbenchPlugins: NameAnd<WorkbenchPlugin> = {
    sql: sqlPlugin,
    email: emailPlugin,
};
