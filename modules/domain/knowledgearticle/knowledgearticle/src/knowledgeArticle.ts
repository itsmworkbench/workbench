import {Capability, PhaseNameAnd} from "@itsmworkbench/domain";
import {Action} from "@itsmworkbench/actions";
import {NameAnd} from "@itsmworkbench/utils";
import {IdentityUrl, nameSpaceDetailsForGit, UrlStoreParser} from "@itsmworkbench/urlstore";
import {YamlCapability} from "@itsmworkbench/yaml";

export type SystemToKnowledgeArticles = NameAnd<KnowledgeArticles>
export type KnowledgeArticles = NameAnd<KnowledgeArticle>
export type Phase = NameAnd<Action>
export interface KnowledgeArticle {
    name?: string
    description?: string
    id?: IdentityUrl
    variables?: string[]
    capabilities: Capability[]
    actions: PhaseNameAnd<Phase>
}

export const checkUsersTT: KnowledgeArticle = ({
    capabilities: ['LDAP'],
    actions: {
        CheckTicket: {
            checkUser: {
                safe: true,
                by: 'LDAP',
                who: 'issuer.email'
            },
            checkApprover: {
                safe: true,
                by: 'LDAP',
                who: 'approval.to'
            }
        },
        Approval: {},
        Resolve: {},
        Close: {},
        Review: {}
    }
})
export const approvalTT: KnowledgeArticle = {
    capabilities: ['Email', 'ReceiveEmail'],
    actions: {
        CheckTicket: {},
        Approval: {
            requestApproval: {
                by: 'Email',
                to: 'approval.to',
                waitingFor: []
            },
            receiveApproval: {
                by: 'ReceiveEmail',
                from: 'approval.to',
                waitingFor: ['requestApproval']
            }
        },
        Resolve: {},
        Close: {},
        Review: {}
    }
}
export const simpleTicketType: KnowledgeArticle = ({
    capabilities: ['Email', 'ReceiveEmail'],
    actions: {
        CheckTicket: {
            SelectKnowledgeArticle: {
                by: 'SelectKnowledgeArticle',
                recordInCapability: false,
            },
            ReviewTicket: {
                by: 'ReviewTicket',
            },
            RequestMoreData: {
                by: 'Email',
                to: 'issuer.email',
                optional: true,
                highlyVariant: true,
                withMissingData: true,
            }
        },
        Approval: {},
        Resolve: {
            // resolveTheIssue: {
            //   by: 'Manual'
            // }
        },
        Close: {
            requestClosure: {
                by: 'Email',
                to: 'issuer.email',
                waitingFor: []
            },
            agreeClosure: {
                by: 'ReceiveEmail',
                from: 'issuer.email',
                waitingFor: ['requestClosure']
            },
            closed: {
                by: 'Ticket',
                waitingFor: ['agreeClosure']
            }
        },
        Review: {
            createKnowledgeArticle: {
                by: 'CreateKnowledgeArticle',
                recordInCapability: false,
                optional: true,
            }
        }
    }
})
export const usingTicketTypeTT: KnowledgeArticle = {
    capabilities: [],
    actions: {
        CheckTicket: {},
        Approval: {},
        Resolve: {},
        Close: {},
        Review: {
            createKnowledgeArticle: {
                by: 'CreateKnowledgeArticle',
                recordInCapability: false,
            }
        }
    }
}
export const usingKATT: KnowledgeArticle = {
    capabilities: [],
    actions: {
        CheckTicket: {},
        Approval: {},
        Resolve: {},
        Close: {},
        Review: {
            reviewKnowledgeArticle: {
                by: 'CreateKnowledgeArticle',
                recordInCapability: false,

            }
        }
    }

}

export const updateSqlTT: KnowledgeArticle = ({
    capabilities: ['SQL'],
    actions: {
        CheckTicket: {
            checkProblemExists: {
                by: 'SQL',
            },
        },
        Approval: {},
        Resolve: {
            checkIssueStillExists: {
                by: 'SQL',
            },
            resolveTheIssue: {
                by: 'SQL',
                waitingFor: ['checkIssueStillExists']
            },
            checkProblemResolved: {
                by: 'SQL',
            },
        },
        Close: {},
        Review: {}
    }
})

export const installSoftwareTT: KnowledgeArticle = ({
    capabilities: ['SSH'],
    actions: {
        CheckTicket: {},
        Approval: {},
        Resolve: {
            installSoftware: {
                by: 'Manual',
            },
        },
        Close: {},
        Review: {}
    }
})

function knowledgeArticleParser(yaml: YamlCapability): UrlStoreParser {return async (id, s) => yaml.parser(s);}

export function knowledgeArticleNamespaceDetails(yaml: YamlCapability) {
    return nameSpaceDetailsForGit('ka', {
        extension: 'yaml',
        mimeType: 'text/markdown; charset=UTF-8',
        parser: knowledgeArticleParser(yaml),
        writer: yaml.writer,
    });
}
