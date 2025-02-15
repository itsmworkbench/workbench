import {commonDataLayoutStyles, commonRendererStyles, Theme} from "@itsmworkbench/themes";

export const itsmTheme: Theme = {
    name: "itsm theme",
    description: "The theme for the itsm workbench",
    header: {logoUrl: 'noLogo'},
    renderer: commonRendererStyles,
    dataLayout: commonDataLayoutStyles
};
