import {FeatureFlag, flaggedValue} from "@itsmworkbench/react_utils";
import {SelectableButton, SimpleSelectableButton} from "@itsmworkbench/selectable_button";
import {ClipHeight} from "@itsmworkbench/clip_height";
import {SimpleTable, Table} from "@itsmworkbench/table";
import {makeContextFor} from "@itsmworkbench/react_utils";
import {BgMouseOver, MouseOver, SimpleBgMouseOver, SimpleMouseOver} from "@itsmworkbench/mouse_over";

const componentsFlagName = "commonCommonComponents";
const componentsFeatureFlag: FeatureFlag = {
    value: "plain",
    options: ["plain", "mui"],
    description: "What type of components",
};

export type CommonComponents = {
    SelectableButton: SelectableButton
    ClipHeight: ClipHeight
    Table: Table
    MouseOver: MouseOver,
    BgMouseOver: BgMouseOver
}
export const commonComponents: CommonComponents = {
    SelectableButton: SimpleSelectableButton,
    ClipHeight: ClipHeight,
    Table: SimpleTable,
    MouseOver: SimpleMouseOver,
    BgMouseOver: SimpleBgMouseOver
};
export const {use: useCommonComponents, Provider: CommonComponentsProvider} = makeContextFor<CommonComponents, "commonComponents">("commonComponents", commonComponents);