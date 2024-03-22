import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { toArray } from "@laoban/utils";

interface MultiParagraphTextProps {
  i18nKey: string | string[]; // Comma-separated keys
}

export const MultiParagraphText: React.FC<MultiParagraphTextProps> = ( { i18nKey } ) => {
  const { t } = useTranslation ();
  // Split the i18nKey string by commas to handle multiple keys
  const keys = toArray ( i18nKey );
  // Reduce the keys to a single array containing all paragraphs
  const paragraphs = keys.reduce ( ( acc: string[], key ) => {
    const translation: string | string[] = t ( key, { returnObjects: true } );
    if ( Array.isArray ( translation ) ) {
      acc.push ( ...translation );
    } else {
      acc.push ( translation );
    }
    return acc;
  }, [] );

  return (
    <>
      {paragraphs.map ( ( paragraph, index ) => (
        <Typography key={index} variant="body1" paragraph>
          {paragraph}
        </Typography>
      ) )}
    </>
  );
};

