import {commonButtonStyles, commonDataLayoutStyles, commonNavStyles, commonObjectDefnTheme, commonPhaseStyles, commonRendererStyles, Theme} from "@itsmworkbench/themes";

export const itsmTheme: Theme = {
    name: "itsm theme",
    description: "The theme for the itsm workbench",
    header: {
        logoUrl: 'itsm.logo.png',
        logoStyle: {
            height: '64px'
        }
    },
    renderer: commonRendererStyles,
    dataLayout: commonDataLayoutStyles,
    objectDefn: commonObjectDefnTheme,
    buttonStyles: commonButtonStyles,
    navStyles: commonNavStyles,
    phaseStyles: commonPhaseStyles
};
