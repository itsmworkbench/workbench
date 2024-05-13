import { SourceSinkDetails } from "@itsmworkbench/indexing";

export type GitHubFile = {
  name: string;
  path: string;
  type: 'file'
  url: string
  html_url: string
  content: string;
  encoding: 'base64'
}
export type GitHubDir = {
  name: string;
  path: string;
  type: 'dir'
}
export type GitHHubDirOrFile = GitHubFile | GitHubDir
export type GitHubFolder = GitHHubDirOrFile[]

export type GitHubRepo = {
  name: string;
  full_name: string;
  owner: {
    login: string
    type: 'Organization'
  }
}
export type GitHubOrganisation = GitHubRepo[]
export type GitHubOrgMember = {
  login: string
}
export type GitHubOrgMembers = GitHubOrgMember[]

export function gitHubFileDetailsToIndexedFile ( file: GitHubFile ): GithubIndexedFile {
  return {
    name: file.name,
    path: file.path,
    url: file.url,
    html_url: file.html_url,
    content: Buffer.from ( file.content, 'base64' ).toString ( 'utf-8' )
  }
}

export type GithubIndexedMember = GitHubOrgMember
export async function gitHubMemberToIndexedFile ( member: GitHubOrgMember ): Promise<GithubIndexedMember> {
  return { login: member.login }

}

export type GithubIndexedFile = {
  name: string;
  path: string;
  url: string
  html_url: string
  content: string;
}

export type GitHubDetails = {
  index: string,
  aclIndex: string
  file: string
  organisations: string[]
  users: string[]
  indexPeople?: boolean
}
const token = process.env.GITHUB_TOKEN;
if ( token === null || token == undefined ) {
  throw new Error ( 'GITHUB_TOKEN not set in environment' )
}

export const githubDetails: SourceSinkDetails = {
  baseurl: "https://api.github.com",
  auth: { method: 'ApiKey', credentials: { apiKey: 'GITHUB_TOKEN' } }
};
