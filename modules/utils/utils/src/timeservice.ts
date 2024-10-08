export type Timeservice = () => number

export const DateTimeService = () => Date.now ();

export const calculateSinceDate = ( timeService: () => number ) => ( relativeTime: string ): Date => {
  const now = new Date ( timeService () );
  const value = parseInt ( relativeTime.slice ( 0, -1 ) );
  const unit = relativeTime.slice ( -1 );

  switch ( unit ) {
    case 'd':
      now.setDate ( now.getDate () - value );
      break;
    case 'h':
      now.setHours ( now.getHours () - value );
      break;
    case 'm':
      now.setMinutes ( now.getMinutes () - value );
      break;
    default:
      throw new Error ( `Unsupported time unit: ${unit}` );
  }
  return now

};
