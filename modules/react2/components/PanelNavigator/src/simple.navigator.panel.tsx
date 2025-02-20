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
        border: "2px solid #ccc",
        cursor: "pointer",
        fontSize: "18px",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        backgroundColor: "#f8f9fa",
        textAlign: "center",
        width: "100%",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
        whiteSpace: "pre-line",
        gridAutoFlow: "dense",
        maxWidth: "300px",
    },
    small: {
        minHeight: "24px",
        padding: "2px",
        borderRadius: "2px",

    },
    medium: {
        minHeight: "50px",
        padding: "20px",
        borderRadius: "5px",
    },
    large: {
        minHeight: "150px",
        padding: "20px",
        borderRadius: "10px",
    },
    panelSelected: {
        backgroundColor: "#007bff",
        color: "white",
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
    layoutSmall: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        gap: '1rem',
        flexWrap: 'wrap', // Allow items to wrap on smaller screens
    },
    icon: {
        fontSize: "40px",
        marginBottom: "10px",
    },
};


export const SimpleNavigatorPanel: OneNavigatorPanel = ({name, Icon, size = 'large', description, ops, onSelected}) => {
    const [hovered, setHovered] = React.useState(false);
    const [selected, setSelected] = ops;
    const isSelected = selected === name;


    const style = {
        ...styles.panel,
        ...(styles[size]),
        ...(isSelected ? styles.panelSelected : {}),
        ...(hovered ? styles.panelHover : {})
    };
    return (
        <div
            style={{...style}}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => {
                setSelected(name);
                onSelected?.(name)
            }}
        >
            {Icon && <Icon/>}
            <div>{camelCaseToWords(name)}</div>
            {size !== 'small' && <><br/>
                <div style={{fontSize: "14px", fontWeight: "normal", color: "#555"}}>
                    {description}
                </div>
            </>}
        </div>
    );
};

export const SimpleNavigatorPanelLayout: NavigatorPanelLayout = ({children, size = 'large'}) => {
    const style = size === 'small' ? styles.layoutSmall : styles.layout;
    return <div style={style}>{children}</div>;
};
