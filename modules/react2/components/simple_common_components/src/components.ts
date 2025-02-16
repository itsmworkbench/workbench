import {CommonComponents} from "@itsmworkbench/common_components";
import {SimpleSelectableButton} from "@itsmworkbench/selectable_button";
import {SimpleTable} from "@itsmworkbench/table";
import {SimpleBgMouseOver, SimpleMouseOver} from "@itsmworkbench/mouse_over";
import {SimpleNavigatorPanel, SimpleNavigatorPanelLayout} from "@itsmworkbench/panelnavigator";
import {ClipHeight} from "@itsmworkbench/clip_height";

export const simpleCommonComponents: CommonComponents = {
    SelectableButton: SimpleSelectableButton,
    ClipHeight: ClipHeight,
    Table: SimpleTable,
    MouseOver: SimpleMouseOver,
    BgMouseOver: SimpleBgMouseOver,
    NavPanelLayout: SimpleNavigatorPanelLayout,
    NavPanel: SimpleNavigatorPanel

};
