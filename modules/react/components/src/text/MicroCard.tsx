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
    <Card sx={{ width:'100%', maxWidth: '75vw' }}>
      <CardHeader
        action={
          <Box display="flex" alignItems="center">
            {icons}
          </Box>
        }
        title={<Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(75vw - 100px)', // Adjust the 100px based on the estimated width of the actions
          }}
        >
          {summary}
        </Box>}
        titleTypographyProps={{ variant: 'body2', noWrap: true }} // Adjust typography as needed
        sx={{ paddingBottom: '8px', paddingTop: '8px' }} // Minimize vertical padding
      />
    </Card>
  );
}