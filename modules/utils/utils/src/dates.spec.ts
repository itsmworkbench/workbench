import {  formatDate } from "./date";

describe('formatDate', () => {
  const template = 'YYYY-MM-DD HH:mm:ss';
  const format = formatDate(template);

  it('should format date correctly with template "YYYY-MM-DD HH:mm:ss"', () => {
    const date = new Date(Date.UTC(2024, 5, 20, 15, 4, 5)); // June 20, 2024 15:04:05 UTC
    const result = format(date);
    expect(result).toBe('2024-06-20 15:04:05');
  });

  it('should format date correctly with template "MM/DD/YYYY"', () => {
    const customTemplate = 'MM/DD/YYYY';
    const customFormat = formatDate(customTemplate);
    const date = new Date(Date.UTC(2024, 5, 20, 15, 4, 5)); // June 20, 2024 15:04:05 UTC
    const result = customFormat(date);
    expect(result).toBe('06/20/2024');
  });

  it('should format date correctly with template "HH:mm:ss on DD-MM-YYYY"', () => {
    const customTemplate = 'HH:mm:ss on DD-MM-YYYY';
    const customFormat = formatDate(customTemplate);
    const date = new Date(Date.UTC(2024, 5, 20, 15, 4, 5)); // June 20, 2024 15:04:05 UTC
    const result = customFormat(date);
    expect(result).toBe('15:04:05 on 20-06-2024');
  });

  it('should pad single digit minutes and seconds correctly', () => {
    const date = new Date(Date.UTC(2024, 5, 20, 5, 4, 5)); // June 20, 2024 05:04:05 UTC
    const result = format(date);
    expect(result).toBe('2024-06-20 05:04:05');
  });

  it('should pad single digit month and day correctly', () => {
    const date = new Date(Date.UTC(2024, 0, 5, 15, 4, 5)); // January 5, 2024 15:04:05 UTC
    const result = format(date);
    expect(result).toBe('2024-01-05 15:04:05');
  });
});
