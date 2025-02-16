import {NameAnd} from "@itsmworkbench/utils";
import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";
import React, {useState} from "react";
import {useTranslation} from "@itsmworkbench/translation";

export type Wizard<T> = NameAnd<WizardStep<T>>
export type WizardStep<T> = {
    descriptionKey: string
    Panel: WizardPanel<T>
}

export type WizardPanelProps<T> = {
    name: string
    description: string
    ops: GetterSetter<T>
    steps: string[]
    stepOps: GetterSetter<string>
}
export type WizardPanel<T> = (props: WizardPanelProps<T>) => React.ReactNode

export type WizardLayoutProps<T> = {
    steps: string[]
    stepOps: GetterSetter<string>
    children: React.ReactNode
}
export type WizardLayout = <T extends any>(props: WizardLayoutProps<T>) => React.ReactNode

export type DisplayWizardProps<T> = {
    wizard: Wizard<T>
    ops: GetterSetter<T>
}
export type DisplayWizard = <T>(props: DisplayWizardProps<T>) => React.ReactNode

export type DisplayBreadcrumbsProps = {
    steps: string[]
    stepOps: GetterSetter<string>
}
export type DisplayBreadcrumbs = (props: DisplayBreadcrumbsProps) => React.ReactNode

export type DisplayBreadcrumbProps = {
    stepOps: GetterSetter<string>
    step: string
    clickable: boolean
}
export type DisplayBreadcrumb = (props: DisplayBreadcrumbProps) => React.ReactNode

export type WizardNextPrevFooterProps = {
    steps: string[]
    stepOps: GetterSetter<string>
}
export type WizardNextPrevFooter = (props: WizardNextPrevFooterProps) => React.ReactNode

export type WizardComponents = {
    Layout: WizardLayout
    Display: DisplayWizard
    Breadcrumbs: DisplayBreadcrumbs
    Breadcrumb: DisplayBreadcrumb
    NextPrevFooter: WizardNextPrevFooter
}

export const {use: useWizardComponents, Provider: WizardComponentsProvider} = makeContextFor<WizardComponents, 'wizardComponents'>('wizardComponents')

export type WizardProps<T> = {
    wizard: Wizard<T>
    ops: GetterSetter<T>
}

export function DisplayWizard<T>({wizard, ops}: WizardProps<T>) {
    const stepOps = useState(Object.keys(wizard)[0])
    const [step] = stepOps
    const {Layout} = useWizardComponents()
    const translation = useTranslation()
    const selected = wizard[step]
    if (!selected) return <div>Unknown step {step}</div>
    const description = translation(selected.descriptionKey)
    return <Layout steps={Object.keys(wizard)} stepOps={stepOps}>
        <selected.Panel name={step} description={description} ops={ops} steps={Object.keys(wizard)} stepOps={stepOps}/>
    </Layout>
}

