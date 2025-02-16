import React from "react";
import { useWizardComponents, WizardLayout } from "./wizard";

const layoutStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1, // Ensures it fills available space
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
};

const wizardContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1, // Ensures the wizard takes available space
    width: "100%",
    maxWidth: "1200px", // Prevents stretching too wide
    margin: "20px",
    justifyContent: "center",
    background: "white",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    border: window.innerWidth > 1200 ? "2px solid #ccc" : "none",
};

export const SimpleWizardLayout: WizardLayout = ({ children, ...ops }) => {
    const { Breadcrumbs } = useWizardComponents();
    return (
        <div data-testid='wizard.layout' style={layoutStyle}>
            <div data-testid='wizard.container' style={wizardContainerStyle}>
                <Breadcrumbs {...ops} />
                {children}
            </div>
        </div>
    );
};
