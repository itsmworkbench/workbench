import axios, { AxiosStatic } from 'axios';

export type ElasticSearchConfig = {
  axios: AxiosStatic
  baseURL?: string
  index?: string
  Authorization: string
  queryFn: ( s: string ) => any
}

export const elasticSearchClient = ( { axios, baseURL, index, Authorization, queryFn }: ElasticSearchConfig ) => {
  if ( !baseURL ) throw new Error ( 'baseURL is required for elastic search. Have you set up the .env file?' );
  if ( !index ) throw new Error ( 'index is required for elastic search. Have you set up the .env file?' );
  const axiosInstance = axios.create ( {
    baseURL,
    headers: {
      Authorization,
      'Content-Type': 'application/json',
    },
  } );
  return async ( query: string ): Promise<HtmlContentUrlAndAnswer[]> => {
    try {
      const response = await axiosInstance.post ( `/${index}/_search`, queryFn ( query ) );
      return contentAndAnswer ( response.data );
    } catch ( error ) {
      console.error ( 'Error querying Elasticsearch:', query, error );
      throw error;
    }
  };
}

export const defaultElasticSearchConfig=(): ElasticSearchConfig => ({
  axios,
  baseURL: process.env.REACT_APP_ELASTIC_SEARCH_URL,
  index: process.env.REACT_APP_ELASTIC_SEARCH_INDEX,
  Authorization: `ApiKey ${process.env.REACT_APP_ELASTIC_SEARCH_TOKEN}`,
  queryFn: ( s: string ) => ({
    knn: {
      // nearest neighbour
      field: "full_text_embeddings",
      query_vector_builder: {
        text_embedding: {
          model_id: ".multilingual-e5-small_linux-x86_64",
          model_text: s,
        },
      },
      k: 5, // two nearest nbr
      num_candidates: 15, // total 5
    },
  })
})

export type HtmlContentUrlAndAnswer = {
  htmlContent?: string
  answer?: string
}
export function contentAndAnswer ( response: any ): HtmlContentUrlAndAnswer[] {
  const parser = new DOMParser ();
  return response.hits.hits.map ( ( res: any ) => {
    const source = res._source
    const htmlContentRaw = source[ 'X-TIKA:content' ]
    function getHtmlContent () {
      if (htmlContentRaw=== undefined) return undefined;
      const doc = parser.parseFromString ( htmlContentRaw, 'text/html' );
      const htmlContent = doc.body.textContent;
      return htmlContent;
    }
    const htmlContent = getHtmlContent ();
    const answer = source[ 'answer' ]
    return { htmlContent, answer }
  } )
}