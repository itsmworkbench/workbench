import React from "react";
import {useWizardComponents, WizardLayout} from "./wizard";

export const SimpleWizardLayout: WizardLayout = ({ children, ...ops }) => {
    const { Breadcrumbs } = useWizardComponents();

    return (
        <div data-testid='wizard.layout' style={layoutStyle}>
            <div data-testid='wizard.container' style={wizardContainerStyle}>
                {/* Breadcrumbs at the top, does not grow */}
                <div data-testid='wizard.breadcrumbs' style={breadcrumbStyle}>
                    <Breadcrumbs {...ops} />
                </div>

                {/* Children take up the rest of the space */}
                <div data-testid='wizard.content' style={contentStyle}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Styles
const layoutStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
};

const wizardContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1, // Ensures it takes available space
    width: "100%",
    maxWidth: "1200px",
    margin: "20px",
    justifyContent: "center",
    background: "white",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    border: window.innerWidth > 1200 ? "2px solid #ccc" : "none",
};

const breadcrumbStyle: React.CSSProperties = {
    flexGrow: 0, // Breadcrumbs stay at the top
    paddingBottom: "10px",
};

const contentStyle: React.CSSProperties = {
    flexGrow: 1, // Children take up the rest of the space
    display: "flex",
    flexDirection: "column",
};
