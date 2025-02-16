import { render } from "@testing-library/react";
import { RawThemeProvider, themeForTests } from "@itsmworkbench/themes";
import React from "react";


export const renderWithProviders = (element: () => React.ReactElement) => {
    return render(
        <RawThemeProvider theme={themeForTests}>
            {element()}
        </RawThemeProvider>,
    );
};