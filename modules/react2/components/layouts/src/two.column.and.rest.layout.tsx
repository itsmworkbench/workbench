import React, { useState, useEffect } from 'react';

type TwoColumnAndRestLayoutProps = {
    rootId?:string
    children: React.ReactNode;
};
export type TwoColumnAndRestLayout = (props: TwoColumnAndRestLayoutProps) => React.ReactNode;

export const SimpleTwoColumnAndRestLayout: React.FC<TwoColumnAndRestLayoutProps> = ({ rootId,children }) => {
    // Convert children to an array
    const childrenArray = React.Children.toArray(children);
    const first = childrenArray[0];
    const second = childrenArray[1];
    const rest = childrenArray.slice(2);

    // State to track if display is narrow (e.g., <600px)
    const [isNarrow, setIsNarrow] = useState<boolean>(window.innerWidth < 600);

    useEffect(() => {
        const handleResize = () => {
            setIsNarrow(window.innerWidth < 600);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Define styles in a Record<string, CSSProperties> variable
    const styles: Record<string, React.CSSProperties> = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
        },
        topRow: {
            display: 'flex',
            flexDirection: isNarrow ? 'column' : 'row',
            width: '100%',
        },
        left: {
            flex: 1,
            padding: '10px',
            boxSizing: 'border-box',
        },
        right: {
            flex: 1,
            padding: '10px',
            boxSizing: 'border-box',
        },
        rest: {
            marginTop: '20px',
            padding: '10px',
            boxSizing: 'border-box',
        },
    };

    return (
        <div data-testid={rootId}style={styles.container}>
            <div data-testid={`${rootId}.topRow`}style={styles.topRow}>
                <div data-testid={`${rootId}.first`}style={styles.left}>{first}</div>
                <div data-testid={`${rootId}.second`}style={styles.right}>{second}</div>
            </div>
            {rest.length > 0 && <div style={styles.rest}>{rest}</div>}
        </div>
    );
};

