// Define styles using CSSProperties
import {CSSProperties} from "react";

const defaultContainerStyle: CSSProperties = {
    border: '1px solid red',
    padding: '10px',
    margin: '5px 0',
    backgroundColor: '#ffe6e6', // Light red background for visibility
    borderRadius: '4px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
};
const defaultDetailsStyle: CSSProperties = {
    whiteSpace: 'pre-wrap',
    marginTop: '10px',
};
const defaultStrongStyle: CSSProperties = {
    color: 'red',
};
const defaultReferenceStyle: CSSProperties = {
    marginTop: '10px',
};
const defaultReportingFailedStyle: CSSProperties = {
    marginTop: '10px',
};
export type ErrorBoundaryStyles = {
    containerStyle?: CSSProperties;
    detailsStyle?: CSSProperties;
    strongStyle?: CSSProperties;
    referenceStyle?: CSSProperties;
    reportingFailedStyle?: CSSProperties;
};
export const defaultErrorBoundaryStyles: ErrorBoundaryStyles = {
    containerStyle: defaultContainerStyle,
    detailsStyle: defaultDetailsStyle,
    strongStyle: defaultStrongStyle,
    referenceStyle: defaultReferenceStyle,
    reportingFailedStyle: defaultReportingFailedStyle,
};