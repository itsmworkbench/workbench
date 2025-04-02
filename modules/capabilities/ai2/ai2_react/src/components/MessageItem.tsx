import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ClipHeight from './ClipHeight';
import { MarkdownRenderer } from '@itsmworkbench/markdown_renderers';
import RoleDisplay from "./RoleDisplay";

export type Message = {
    role: string;
    content: string;
};

type MessageItemProps = {
    message: Message;
};

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const [expanded, setExpanded] = useState(false);

    const handleCopy = () => {
        // raw data
        navigator.clipboard.writeText(JSON.stringify(message, null, 2));
    };

    return (
        <Box sx={{ marginBottom: 1, border: '1px solid #ddd', padding: 1, borderRadius: 1 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                }}
            >
                <RoleDisplay role={message.role} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Copy Raw Data">
                        <IconButton size="small" onClick={handleCopy}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {expanded ? (
                        <Tooltip title="Collapse">
                            <IconButton size="small" onClick={() => setExpanded(false)}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Expand">
                            <IconButton size="small" onClick={() => setExpanded(true)}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            <ClipHeight maxHeight={70} expanded={expanded}>
                <MarkdownRenderer attribute="content" rootId="message" value={message.content} />
            </ClipHeight>
        </Box>
    );
};

export default MessageItem;
