import React from 'react';
import { useRememberChatCompletion } from './ai.react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import {DevModeComponent} from "@itsmworkbench/devmode";
import CopyableCell from './CopyableCell';

export const DevModeAi: DevModeComponent = () => {
    const [remembered] = useRememberChatCompletion();

    return (
        <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
            <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: '#f5f5f5' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRight: '1px solid #d3d3d3'
                                }}
                            >
                                Request
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            >
                                Response
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {remembered.map((item, index) => (
                            <TableRow key={index}>
                                <CopyableCell text={JSON.stringify(item.req, null, 2)} backgroundColor="white" />
                                <CopyableCell text={JSON.stringify(item.res, null, 2)} backgroundColor="#f5f5f5" />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};