import { calculateSinceDate } from "./timeservice";

describe('calculateSinceDate', () => {
  const fixedTime = new Date('2024-05-25T12:00:00Z').getTime();
  const timeService = () => fixedTime;

  it('should correctly calculate the date for "-1d"', () => {
    const result = calculateSinceDate('-1d', timeService);
    expect(result.toISOString()).toBe('2024-05-24T12:00:00.000Z');
  });

  it('should correctly calculate the date for "-5h"', () => {
    const result = calculateSinceDate('-5h', timeService);
    expect(result.toISOString()).toBe('2024-05-25T07:00:00.000Z');
  });

  it('should correctly calculate the date for "-30m"', () => {
    const result = calculateSinceDate('-30m', timeService);
    expect(result.toISOString()).toBe('2024-05-25T11:30:00.000Z');
  });

  it('should throw an error for unsupported time unit', () => {
    expect(() => calculateSinceDate('-1w', timeService)).toThrow('Unsupported time unit: w');
  });
});
