import fetchMock from 'jest-fetch-mock';
import { apiClientForTicketVariables } from "./api.client.ticket.variables";

fetchMock.enableMocks ();

beforeEach ( () => {
  // Reset fetchMock before each test
  fetchMock.resetMocks ();
} );

afterAll ( () => {
  fetchMock.disableMocks ();
} );
describe ( "apiClientForTicketVariables", () => {
  test ( 'fetches ticket variables successfully', async () => {
    // Mock the fetch response for a successful request
    fetchMock.mockResponseOnce ( JSON.stringify ( { key: 'value' } ) );

    const url = 'https://example.com/api/tickets';
    const ticket = 'TICKET123';
    const apiClient = apiClientForTicketVariables ( { url } );
    const response = await apiClient ( ticket );

    // Assertions to verify the behavior of apiClientForTicketVariables
    expect ( fetchMock ).toHaveBeenCalledTimes ( 1 );
    expect ( fetchMock ).toHaveBeenCalledWith ( url, {
      method: 'POST',
      body: ticket ,
      headers: { 'Content-Type': 'text/plain' },
    } );
    expect ( response ).toEqual ( { key: 'value' } );
  } );
} );