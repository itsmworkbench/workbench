import {CSSProperties, ReactElement} from "react";
import {makeContextFor, useFeatureFlag, useThrowError} from "@itsmworkbench/react_utils";
import React from "react";

export const themeFF = "theme";

export type RendererStyles = {
    h1WithUrl: CSSProperties
    label: CSSProperties
    text: CSSProperties
    link: CSSProperties
    headerLink: CSSProperties

}


export type HeaderTheme = {
    logoUrl: string
    logoStyle?: CSSProperties
}


export type DataLayoutStyles = {
    dataLayoutContainer: CSSProperties,
    dataLayoutRow: CSSProperties,
    dataLayoutItem: CSSProperties,
    mouseOverColor: string,
    linkMouseOverColor: string,
    themedIconColor: string,


}

export const commonDataLayoutStyles: DataLayoutStyles = {
    dataLayoutContainer: {
        display: "flex",  // Change to flex to allow stretching
        flexDirection: "column",
        // flexGrow: 1,      // Allow it to grow and fill parent space
        // alignSelf: "stretch",  // Stretch to parent width
        // border: "1px solid #ddd",
        gap: "0.1rem",
        padding: "0.5rem",
        borderRadius: "8px"
        // flex: 2,
    },
    dataLayoutRow: {
        // display: "flex",
        // width: "100%",    // Ensure rows fill container
        // gap: "0.2rem",
    },
    dataLayoutItem: {
        flex: 1,  // Allow items to fill row space
        // padding: "0.5rem",
        borderRadius: "2px",
        marginTop: "0px",
        whiteSpace: "break-spaces",  // Keep line breaks within items
    },
    mouseOverColor: "#f0f0f0",
    linkMouseOverColor: "#f0f0f0",
    themedIconColor: "#ea1b0a",
};

export type ObjectDefnTheme = {
    selected: CSSProperties
    notSelected: CSSProperties
}

export const commonObjectDefnTheme: ObjectDefnTheme = {
    notSelected: {
        border: 'none',
        padding: '0px', // optional: add some padding so the border doesn't clash with the content
        display: 'inline-block',
        width: '100%',
    },
    selected: {
        border: '2px solid #e0e0e0',
        padding: '2px', // optional: add some padding so the border doesn't clash with the content
        display: 'inline-block',
        width: '100%',
    }

}

export type ButtonStyles = Record<'icon', CSSProperties>
export const commonButtonStyles: ButtonStyles = {
    icon: {
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        verticalAlign: "middle",
        color: "gray",
        padding: "0 1px",
    }
}

export const commonNavHeader: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#556CD6'
}
export type NavStyles = {
    navHeader: CSSProperties
}
export const commonNavStyles: NavStyles = {
    navHeader: commonNavHeader
}

export type PhaseStyles = {
    statusToStyle: Record<string, CSSProperties>
    basePhaseStyle: CSSProperties
    layout: CSSProperties
}

export const commonPhaseStyles: PhaseStyles = {
    statusToStyle: {
        completed: {backgroundColor: 'lightgreen'},
        'in-progress': {backgroundColor: 'lightblue'},
        failed: {backgroundColor: 'salmon'},
        waiting: {backgroundColor: 'lightgray'},
    },
    basePhaseStyle: {
        padding: '8px 16px',
        borderRadius: '4px',
        marginBottom: '8px', // Helps when wrapping on small screens.
        textAlign: 'center',
        minWidth: '120px',
    },
    layout: {
        display: 'flex',
        flexWrap: 'wrap',  // This allows overflow to next line when too wide.
        gap: '8px',        // Consistent spacing between items.
        alignItems: 'center'
    }
}

export type Theme = {
    name: string
    description: string
    header: HeaderTheme
    renderer: RendererStyles
    dataLayout: DataLayoutStyles
    objectDefn: ObjectDefnTheme
    buttonStyles: ButtonStyles
    navStyles: NavStyles
    phaseStyles: PhaseStyles
}

export const commonLink: CSSProperties = {
    color: "#958d8b",
    display: "inline-block",
    gap: "8px",
    fontWeight: 400,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "calc(100% - 16px)",
};
export const commonRendererStyles: RendererStyles = {
    // verma
    h1WithUrl: {
        color: "#262626",
        fontSize: "18px",
        fontWeight: 500,
        margin: "0 0 4px 0", // Reduced bottom margin
        padding: "0",        // Removed padding
        lineHeight: "1.2",   // Adjusted line height for tighter spacing
    },
    label: {
        color: "#5c5c5c",
        fontSize: "12px",
        alignContent: "center",
    },
    text: {
        color: "#262626",
        fontSize: "14px",
        display: 'inline-flex', //to support the clipboard button
        alignItems: 'center',
        width: '100%',
        overflowWrap: "anywhere"
    },
    headerLink: {
        ...commonLink,
        display: "flex",
        fontSize: "18px",
        color: "#262626",
    },
    link: {
        ...commonLink,
        fontSize: "16px",
        display: 'inline-flex', //to support the clipboard button
        alignItems: 'center',
    },
};
export const themeForTests: Theme = {
    name: "test theme",
    description: "The theme for tests",
    header: {
        logoUrl: "itsm.logo.png",
    },
    renderer: commonRendererStyles,
    dataLayout: commonDataLayoutStyles,
    objectDefn: commonObjectDefnTheme,
    buttonStyles: commonButtonStyles,
    navStyles: commonNavStyles,
    phaseStyles: commonPhaseStyles
};


export const {use: useTheme, Provider: RawThemeProvider} = makeContextFor<Theme, "theme">("theme");

export type ThemeProviderProps = {
    themes: Record<string, Theme>
    children: ReactElement
}

export function ThemeProvider({children, themes}: ThemeProviderProps) {
    const ff = useFeatureFlag(themeFF) as string;
    const firstTheme = Object.keys(themes)[0];
    const realTheme = (ff === "default" || !ff) ? themes[firstTheme] : themes[ff];
    const throwError = useThrowError();
    if (!realTheme) throwError("s/w", `Theme ${realTheme} not found. Feature flag is ${ff}, Firs theme is ${firstTheme} themes are ${Object.keys(themes).join(", ")}`);
    return <RawThemeProvider theme={realTheme}>{children}</RawThemeProvider>;
}