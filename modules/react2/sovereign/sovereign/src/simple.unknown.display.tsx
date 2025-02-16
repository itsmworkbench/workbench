import {useSelectedSovereign, useSovereignStatePlugins} from "./sovereign.selection.state";
import React from "react";
import {useTranslation} from "@itsmworkbench/translation";

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
    },
    message: {
        fontSize: '20px',
        marginBottom: '20px',
        whiteSpace: "pre-line"
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#0078d7',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#005bb5',
    }
};

export function SimpleUnknownDisplay() {
    const [selected, setSelected] = useSelectedSovereign();
    const {plugins} = useSovereignStatePlugins();
    const translate = useTranslation();
    return (
        <div style={styles.container}>
            <div style={styles.message}>{translate('sovereign.unknown.display')}<strong>{selected}</strong></div>
            <button
                style={styles.button}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.button)}
                onClick={() => {
                    const name = Object.keys(plugins)[0];
                    console.log('trying to reload', name);
                    setSelected(name);
                }}
            >
                {translate('sovereign.unknown.reload')}
            </button>

        </div>
    );
}
