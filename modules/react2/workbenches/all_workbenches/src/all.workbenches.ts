import {WorkbenchPlugins} from "modules/react2/workbenches/workbenches";
import {sqlWorkbenchPlugin} from "@itsmworkbench/sql_workbench";
import {emailWorkbenchPlugin} from "@itsmworkbench/email_workbench";

export const allWorkbenchPlugins:WorkbenchPlugins = {
    sql: sqlWorkbenchPlugin,
    email: emailWorkbenchPlugin,
};
