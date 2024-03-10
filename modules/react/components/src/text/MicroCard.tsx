import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { Box } from '@mui/material';

export type MicroCardProps = {
  summary: string;
  icons: React.ReactNode;
};

export function MicroCard ( { summary, icons }: MicroCardProps ) {
  return (
    <Card>
      <CardHeader
        action={
          <Box display="flex" alignItems="center">
            {icons}
          </Box>
        }
        title={summary} // Your summary string here
        titleTypographyProps={{ variant: 'body2', noWrap: true }} // Adjust typography as needed
        sx={{ paddingBottom: '8px', paddingTop: '8px' }} // Minimize vertical padding
      />
    </Card>
  );
}