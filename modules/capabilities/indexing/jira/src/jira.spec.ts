import { JiraIssuePaging, makeJqlUrlForProject } from "./jira.index";

describe ( 'makeJqlUrlForProject', () => {
  const apiVersion = '2';
  const forestId = 'MY_PROJECT';
  const page: JiraIssuePaging = {
    startAt: 0,
    maxResults: 50,
    total: 100,
  };

  const jiraIssuePagingQuerySuffix = ( page: JiraIssuePaging ): string => {
    return `&startAt=${page.startAt}&maxResults=${page.maxResults}`;
  };

  it ( 'should construct the correct URL without the since parameter', () => {
    const url = makeJqlUrlForProject ( apiVersion, undefined, forestId, page );
    expect ( url ).toBe ( `rest/api/2/search?jql=project%3DMY_PROJECT&fields=*all,comment&startAt=0&maxResults=50` );
  } );

  it ( 'should construct the correct URL with the since parameter (1d)', () => {
    const since = '1d';
    const url = makeJqlUrlForProject ( apiVersion, since, forestId, page );
    expect ( url ).toBe ( `rest/api/2/search?jql=project%3DMY_PROJECT%20and%20updated%20%3E%3D%20-1d&fields=*all,comment&startAt=0&maxResults=50` );
  } );

  it ( 'should construct the correct URL with the since parameter (2h)', () => {
    const since = '2h';
    const url = makeJqlUrlForProject ( apiVersion, since, forestId, page );
    expect ( url ).toBe ( `rest/api/2/search?jql=project%3DMY_PROJECT%20and%20updated%20%3E%3D%20-2h&fields=*all,comment&startAt=0&maxResults=50` );
  } );

  it ( 'should construct the correct URL with the since parameter (30m)', () => {
    const since = '30m';
    const url = makeJqlUrlForProject ( apiVersion, since, forestId, page );
    expect ( url ).toBe ( `rest/api/2/search?jql=project%3DMY_PROJECT%20and%20updated%20%3E%3D%20-30m&fields=*all,comment&startAt=0&maxResults=50` );
  } );
} );
