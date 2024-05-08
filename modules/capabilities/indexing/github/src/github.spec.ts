// Import the function if it's in a different file
// import { parseGitHubLinkHeader } from './path_to_your_function';

import { parseGitHubLinkHeader } from "./github.index.tree";

describe('parseGitHubLinkHeader', () => {
  it('should extract the next URL if present', () => {
    const linkHeader = '<https://api.github.com/resource?page=2>; rel="next", <https://api.github.com/resource?page=last>; rel="last"';
    const result = parseGitHubLinkHeader({},linkHeader);
    expect(result.next).toBe('https://api.github.com/resource?page=2');
  });

  it('should return an empty object if no next URL is present', () => {
    const linkHeader = '<https://api.github.com/resource?page=last>; rel="last"';
    const result = parseGitHubLinkHeader({},linkHeader);
    expect(result).toEqual({});
  });

  it('should handle an empty Link header', () => {
    const linkHeader = '';
    const result = parseGitHubLinkHeader({},linkHeader);
    expect(result).toEqual({});
  });

  it('should handle null input gracefully', () => {
    const result = parseGitHubLinkHeader({},null);
    expect(result).toEqual({});
  });
});
