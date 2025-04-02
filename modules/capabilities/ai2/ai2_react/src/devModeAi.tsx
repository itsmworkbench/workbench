import React from 'react';
import { useRememberChatCompletion } from './ai.react';
import { Box, Typography, Table, TableBody, TableContainer, TableHead, TableRow, Paper, TableCell } from '@mui/material';
import { DevModeComponent } from '@itsmworkbench/devmode';
import DisplayMessages from './components/DisplayMessages';

export const DevModeAi: DevModeComponent = () => {
    const [remembered] = useRememberChatCompletion();

    const formatRequest = (data: any) => {
        if (Array.isArray(data)) {
            return <DisplayMessages messages={data} />;
        }
        return (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
        );
    };

    const formatResponse = (data: any) => {
        if (data instanceof Error) {
            return (
                <pre style={{ color: 'red', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
          {data.message}
        </pre>
            );
        }
        if (data && typeof data === 'object' && data.value) {
            if (Array.isArray(data.value)) {
                return <DisplayMessages messages={data.value} />;
            }
            if (data.value.role && data.value.content) {
                return <DisplayMessages messages={[data.value]} />;
            }
        }
        if (Array.isArray(data)) {
            return <DisplayMessages messages={data} />;
        }
        return (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
        );
    };

    return (
        <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
            <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: 'white' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRight: '1px solid #d3d3d3',
                                    verticalAlign: 'top',
                                }}
                            >
                                REQUEST
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    verticalAlign: 'top',
                                    borderLeft: '1px solid #d3d3d3',
                                }}
                            >
                                RESPONSE
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {remembered.map((item, index) => (
                            <TableRow
                                key={index}
                                sx={{
                                    borderBottom: '1px solid white',
                                    '&:hover': { backgroundColor: '#f0f2f2', borderBottom: '1px solid grey' },
                                }}
                            >
                                <TableCell sx={{ verticalAlign: 'top', borderRight: '1px solid #d3d3d3' }}>
                                    {formatRequest(item.req)}
                                </TableCell>
                                <TableCell sx={{ verticalAlign: 'top' }}>
                                    {formatResponse(item.res)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
