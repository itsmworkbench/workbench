import React from 'react';
import { TableCell, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type CopyableCellProps = {
    text: string;
    backgroundColor?: string;
};

const CopyableCell: React.FC<CopyableCellProps> = ({ text, backgroundColor = 'inherit' }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
    };

    return (
        <TableCell sx={{ verticalAlign: 'top', position: 'relative', backgroundColor }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
        {text}
      </pre>
            <Tooltip title="Copy">
                <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 4, right: 4 }}
                    onClick={handleCopy}
                >
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </TableCell>
    );
};

export default CopyableCell;
