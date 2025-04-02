import React from 'react';
import { Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';

type RoleDisplayProps = {
    role: string;
};

const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
        case 'user':
            return <PersonIcon fontSize="inherit" />;
        case 'assistant':
            return <SmartToyIcon fontSize="inherit" />;
        case 'system':
            return <SettingsIcon fontSize="inherit" />;
        default:
            return null;
    }
};

const capitalize = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const RoleDisplay: React.FC<RoleDisplayProps> = ({ role }) => {
    return (
        <Typography
            variant="subtitle2"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
            }}
        >
            {getRoleIcon(role)}
            {capitalize(role)}
        </Typography>
    );
};

export default RoleDisplay;
