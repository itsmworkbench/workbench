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


const format = formatDate ( 'YYYY-MM-DD HH:mm:ss' );
export function calculateSinceDate ( since: string, timeService: Timeservice ): string {
  const now = new Date ( timeService () );

  // Extract the numeric value and the unit from the 'since' string
  const value = parseInt ( since.slice ( 0, -1 ), 10 );
  const unit = since.slice ( -1 );

  let pastDate: Date;

  // Calculate the past date based on the unit
  switch ( unit ) {
    case 'd':
      pastDate = new Date ( now.getTime () - value * 24 * 60 * 60 * 1000 );
      break;
    case 'h':
      pastDate = new Date ( now.getTime () - value * 60 * 60 * 1000 );
      break;
    case 'm':
      pastDate = new Date ( now.getTime () - value * 60 * 1000 );
      break;
    default:
      throw new Error ( `Invalid unit '${unit}' in 'since' string ${since}` );
  }

  // Format the past date as a string suitable for MySQL
  return format ( pastDate );
}
