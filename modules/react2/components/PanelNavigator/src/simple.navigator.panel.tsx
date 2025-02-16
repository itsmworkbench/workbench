import React from "react";
import {NavigatorPanelLayout, OneNavigatorPanel} from "./navigator.panel";
import {camelCaseToWords} from "@itsmworkbench/utils";
import {useSelectedSovereign} from "@itsmworkbench/sovereign";

const styles: Record<string, React.CSSProperties> = {
    panel: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        borderRadius: "10px",
        border: "2px solid #ccc",
        cursor: "pointer",
        fontSize: "18px",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        backgroundColor: "#f8f9fa",
        textAlign: "center",
        width: "100%",
        maxWidth: "300px", // Ensures they don't stretch too far
        minHeight: "150px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
        whiteSpace: "pre-line",
        gridAutoFlow:"dense"

    },
    panelHover: {
        backgroundColor: "#e9ecef",
        boxShadow: "4px 4px 15px rgba(0,0,0,0.2)",
    },
    layout: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(calc(280px + 30px), 1fr))",
        gap: "30px", // Ensures proper spacing horizontally and vertically
        width: "100%",
        maxWidth: "1200px", // Prevents too much stretching
        margin: "auto",
        padding: "20px",

    },
    icon: {
        fontSize: "40px",
        marginBottom: "10px",
    },
};


export const SimpleNavigatorPanel: OneNavigatorPanel = ({name, Icon, description}) => {
    const [hovered, setHovered] = React.useState(false);
    const [selected, setSelected] = useSelectedSovereign();
    return (
        <div
            style={{...styles.panel, ...(hovered ? styles.panelHover : {})}}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setSelected(name)}
        >
            <Icon/>
            <div>{camelCaseToWords(name)}</div>
            <br />
            <div style={{fontSize: "14px", fontWeight: "normal", color: "#555"}}>
                {description}
            </div>
        </div>
    );
};

export const SimpleNavigatorPanelLayout: NavigatorPanelLayout = ({children}) => {
    return <div style={styles.layout}>{children}</div>;
};
