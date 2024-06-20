import { Timeservice } from "./timeservice";

export const formatDate = ( template: string ) => ( date: Date ): string => {
  const pad = ( n: number ) => n.toString ().padStart ( 2, '0' );

  const replacements: Record<string, string> = {
    'YYYY': date.getUTCFullYear ().toString (),
    'MM': pad ( date.getUTCMonth () + 1 ),
    'DD': pad ( date.getUTCDate () ),
    'HH': pad ( date.getUTCHours () ),
    'mm': pad ( date.getUTCMinutes () ),
    'ss': pad ( date.getUTCSeconds () )
  };

  return template.replace ( /YYYY|MM|DD|HH|mm|ss/g, match => replacements[ match ] );
};

