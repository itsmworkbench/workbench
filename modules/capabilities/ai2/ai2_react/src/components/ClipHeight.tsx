import React from 'react';
import { Box } from '@mui/material';

type ClipHeightProps = {
    children: React.ReactNode;
    maxHeight?: number;
    expanded?: boolean;
};

const ClipHeight: React.FC<ClipHeightProps> = ({ children, maxHeight = 100, expanded = false }) => {
    return (
        <Box
            sx={{
                maxHeight: expanded ? 'none' : `${maxHeight}px`,
                overflow: 'hidden',
            }}
        >
            {children}
        </Box>
    );
};

export default ClipHeight;
