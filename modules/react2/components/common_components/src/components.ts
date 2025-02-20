import {FeatureFlag, flaggedValue} from "@itsmworkbench/react_utils";
import {SelectableButton, SimpleSelectableButton} from "@itsmworkbench/selectable_button";
import {ClipHeight} from "@itsmworkbench/clip_height";
import {SimpleTable, Table} from "@itsmworkbench/table";
import {makeContextFor} from "@itsmworkbench/react_utils";
import {Password, SimplePassword} from "@itsmworkbench/secrets";
import {BgMouseOver, MouseOver, SimpleBgMouseOver, SimpleMouseOver} from "@itsmworkbench/mouse_over";
import {OneNavigatorPanel, NavigatorPanelLayout, SimpleNavigatorPanel, SimpleNavigatorPanelLayout} from "@itsmworkbench/panelnavigator";

const componentsFlagName = "commonCommonComponents";
const componentsFeatureFlag: FeatureFlag = {
    value: "plain",
    options: ["plain", "mui"],
    description: "What type of components",
};

export type CommonComponents = {
    SelectableButton: SelectableButton
    Password: Password,
    ClipHeight: ClipHeight
    Table: Table
    MouseOver: MouseOver,
    BgMouseOver: BgMouseOver
    NavPanelLayout: NavigatorPanelLayout
    NavPanel: OneNavigatorPanel
}
export const commonComponents: CommonComponents = {
    SelectableButton: SimpleSelectableButton,
    Password: SimplePassword,
    ClipHeight: ClipHeight,
    Table: SimpleTable,
    MouseOver: SimpleMouseOver,
    BgMouseOver: SimpleBgMouseOver,
    NavPanelLayout: SimpleNavigatorPanelLayout,
    NavPanel: SimpleNavigatorPanel

};
export const {use: useCommonComponents, Provider: CommonComponentsProvider} = makeContextFor<CommonComponents, "commonComponents">("commonComponents", commonComponents);