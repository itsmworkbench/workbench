export type UserData = {
    loggedIn: boolean
    email: string
    isDev: boolean
    isAdmin: boolean
}

export const emptyUserData: UserData = {
    loggedIn: false,
    email: '',
    isDev: false,
    isAdmin: false
}
export type UserDataGetter = () => UserData