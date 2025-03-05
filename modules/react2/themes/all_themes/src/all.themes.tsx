import {OptionsFeatureFlag} from "@itsmworkbench/react_utils";
import {Theme} from "@itsmworkbench/themes";
import {itsmTheme} from "@itsmworkbench/itsm_themes";


export const allThemes: Record<string, Theme> = {
    itsm: itsmTheme
};

export type ThemeName = keyof typeof allThemes;

export const themeNames: ThemeName[] = Object.keys(allThemes) as ThemeName[];


export const themeFeatureFlag: OptionsFeatureFlag = {
    description: "Choose the theme",
    value: "default",
    options: ["default", ...themeNames],
};