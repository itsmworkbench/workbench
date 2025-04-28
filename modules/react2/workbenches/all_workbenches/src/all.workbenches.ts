import {WorkbenchPlugins} from "@itsmworkbench/workbenches";
import {sqlWorkbenchPlugin} from "@itsmworkbench/sql_workbench";
import {emailWorkbenchPlugin} from "@itsmworkbench/email_workbench";

export const allWorkbenchPlugins:WorkbenchPlugins = {
    sql: sqlWorkbenchPlugin,
    email: emailWorkbenchPlugin,
};
