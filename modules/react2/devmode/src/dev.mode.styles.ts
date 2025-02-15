import {CSSProperties} from "react";

const containerStyle: CSSProperties = {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
};

const checkboxContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #ddd",
};

const labelStyle: CSSProperties = {
    fontSize: "16px",
    marginLeft: "10px",
};

const checkboxStyle: CSSProperties = {
    transform: "scale(1.2)",
};

const headingStyle: CSSProperties = {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#333",
};

const debugInfoStyle: CSSProperties = {
    marginTop: "20px",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
};


const buttonContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    gap: "10px",
};

const buttonStyle: CSSProperties = {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
};

const clearButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#f44336",
    color: "white",
};

const resetButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#4CAF50",
    color: "white",
};

const fromUrlButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#2196F3",
    color: "white",
};
export type DevModeStyles=typeof devModeStyles;
export const devModeStyles = {
    containerStyle,
    checkboxContainerStyle,
    labelStyle,
    checkboxStyle,
    headingStyle,
    debugInfoStyle,
    fromUrlButtonStyle,
    buttonContainerStyle,
    clearButtonStyle,
    resetButtonStyle,
}
