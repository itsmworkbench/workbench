import {DisplayWizard, WizardComponents} from "./wizard";
import {SimpleDisplayBreadcrumb, SimpleDisplayBreadcrumbs} from "./breadcrumbs";
import {SimpleWizardNextPrevFooter} from "./simple.wizard.next.prev.footer";
import {SimpleWizardLayout} from "./simple.wizard.layout";

export const SimpleWizardComponents: WizardComponents = {
    Display: DisplayWizard,
    Breadcrumb: SimpleDisplayBreadcrumb,
    Breadcrumbs: SimpleDisplayBreadcrumbs,
    NextPrevFooter: SimpleWizardNextPrevFooter,
    Layout: SimpleWizardLayout
}