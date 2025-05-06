declare global {
    interface Window {
        google: any;
    }

    namespace google {
        namespace accounts {
            namespace oauth2 {
                interface TokenClient {
                    requestAccessToken: () => void;
                    setClientId: (clientId: string) => void;
                }
            }
        }

        namespace client {
            interface Gmail {
                users: {
                    messages: {
                        list: (params: { userId: string; maxResults: number }) => Promise<any>;
                        get: (params: { userId: string; id: string }) => Promise<any>;
                    };
                };
            }
        }
    }
}

export {};
