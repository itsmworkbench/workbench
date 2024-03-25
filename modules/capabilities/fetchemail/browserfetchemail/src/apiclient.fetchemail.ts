import { FetchEmailer } from "@itsmworkbench/fetchemail";

function postToApi ( url: string ) {
  return async ( options: any ) => {
    const response = await fetch ( url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify ( options )
    } );
    return response.json ();
  };
}

//why post? because they are expensive. Get comes with a lot of assumptions about 'reading is cheap'
export function apiClientFetchEmailer ( url: string ): FetchEmailer {
  return {
    listEmails: postToApi ( `${url}/list` ),
    fetchEmail: postToApi ( `${url}/fetchEmail` ),
    testConnection: () => postToApi ( `${url}/testConnection` ) ( {} )
  }
}