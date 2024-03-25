import React from 'react';
import { Box, Card, CardContent, Paper, Typography } from '@mui/material';
import { EmailContent } from "@itsmworkbench/fetchemail";

export type EmailDetailsProps = {
  email: EmailContent | undefined | string;
}
export function EmailDetails ( { email }: EmailDetailsProps ) {
  if ( !email ) return <Typography variant="h6" align="center">No Email</Typography>;
  if ( typeof email === "string" ) return <Typography variant="h6" align="center">{email}</Typography>;

  const { subject, from, date, textBody } = email;
  const formattedDate = new Date ( date ).toLocaleString ();

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
      <Typography variant="h5" gutterBottom>{subject}</Typography>
      <Typography variant="subtitle1" gutterBottom>{from}</Typography>
      <Typography variant="subtitle2" gutterBottom>{formattedDate}</Typography>
      <Box marginTop={2}>
        {textBody.map((para, index) => (
          <Card key={index} variant="outlined" sx={{ marginBottom: 2, backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
            <CardContent>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {para}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
}