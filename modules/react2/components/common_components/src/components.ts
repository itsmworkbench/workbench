import {FeatureFlag, makeContextFor} from "@itsmworkbench/react_utils";
import {SelectableButton, SimpleSelectableButton} from "@itsmworkbench/selectable_button";
import {ClipHeight} from "@itsmworkbench/clip_height";
import {SimpleTable, Table} from "@itsmworkbench/table";
import {Password, SimplePassword} from "@itsmworkbench/secrets";
import {BgMouseOver, MouseOver, SimpleBgMouseOver, SimpleMouseOver} from "@itsmworkbench/mouse_over";
import {NavigatorPanelLayout, OneNavigatorPanel, SimpleNavigatorPanel, SimpleNavigatorPanelLayout} from "@itsmworkbench/panelnavigator";
import {SimpleTwoColumnAndRestLayout, TwoColumnAndRestLayout} from "@itsmworkbench/layouts";
import {PanelsInARow, PanelWithWidth, SimplePanelsInARow, SimplePanelWithWidth} from "@itsmworkbench/rows_and_panels";
import {LoadingDisplay, simpleLoadingDisplay} from "@itsmworkbench/loading";
import {ClipboardButton, SimpleClipboardButton} from "@itsmworkbench/buttons";

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
    TwoColumnAndRestLayout: TwoColumnAndRestLayout
    PanelWithWidth: PanelWithWidth
    PanelsInARow: PanelsInARow
    LoadingDisplay: LoadingDisplay
    ClipboardButton: ClipboardButton
}
export const commonComponents: CommonComponents = {
    SelectableButton: SimpleSelectableButton,
    Password: SimplePassword,
    ClipHeight: ClipHeight,
    Table: SimpleTable,
    MouseOver: SimpleMouseOver,
    BgMouseOver: SimpleBgMouseOver,
    NavPanelLayout: SimpleNavigatorPanelLayout,
    NavPanel: SimpleNavigatorPanel,
    TwoColumnAndRestLayout: SimpleTwoColumnAndRestLayout,
    PanelWithWidth: SimplePanelWithWidth,
    PanelsInARow: SimplePanelsInARow,
    LoadingDisplay: simpleLoadingDisplay,
    ClipboardButton: SimpleClipboardButton

};
export const {use: useCommonComponents, Provider: CommonComponentsProvider} = makeContextFor<CommonComponents, "commonComponents">("commonComponents", commonComponents);