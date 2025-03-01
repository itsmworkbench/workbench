export const itsmTranslation = {
    common: {
        select: 'Select',
        clear: 'Clear',
    },

    authentication: {
        method: 'Method',
        credentials: {
            apiKey: 'ApiKey'
        }
    },

    devMode: {
        debug: "Debug",
        hide: "Hide DevMode",
        show: "Developer Mode",
        language: 'Language',
        featureFlags: "Feature Flags",
        Sovereign: "Sovereign State",
        translation: {
            used: "Used",
            errors: "Errors",
            notFound: "Not Found"
        },
        userData: "User Data",
        hasEnteredPassword: 'Has entered password',
        hasPassword: 'Has password',
        secretData: 'Secret Data',
        secretDataInLocalStorage: 'Secret Data In Local Storage',
    },
    knowledgeArticle: {
        phase: {
            Approval: {title: 'Approval'},
            CheckTicket: {title: 'Check Ticket'},
            Close: {title: 'Close'},
            Resolve: {title: 'Resolve'},
            Review: {title: 'Review'},
        }
    },

    login: {
        login: "Login",
        logout: "Logout",
        loggedIn: "",
    },

    nav: {
        getStarted: `Click here to learn how to get started`,
        newTicket: "Start processing a new ticket.\n\nImport from servicenow or just create a new one",
        activeTickets: "Find your started but not finished tickets here",
        authentication: "Storing and managing your passwords and tokens",
        historicalTickets: "All your completed tickets can be found here",
        systems: "Describe the systems and services you are working with, and how they are connected",
        healthCheck: "Validates that the systems you want to link to are working",
        examineKnowledgeArticles: "Knowledge articles describe how to solve common problems.\n\nNormally when processing a ticket after the first time you will be using a knowledge article",
        askForHelp: "When you are stuck, talk to a human here",
    },
    newTicket: {
        wizard: {
            whereIsTicket: `Here we will select how we get the ticket`,
            createTicket: "Here we create the ticket we want to process\nThis can be by importing from servicenow or by creating a new ticket",
        },
        id: "id",
        description: 'Description',
        prompt: 'Prompt',
        summary: 'Summary',
        ticket: 'Ticket',
        newKa: 'None of these are the right knowledge article, I will create a new one',
        reset: 'Reset',
        cancelNewKa: `Let's look at the knowledge articles again`,
    },

    sovereign: {
        unknown: {
            display: 'Oops! Something went wrong.\n An unknown url was requested\n\n',
            reload: 'Start again',
        }
    }
}