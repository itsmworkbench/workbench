export type LoginOpsFn = () => Promise<void>;
export type LoginOps = {
    //Doesn't pop open a new window, but logs in if it can
    refreshLogin: LoginOpsFn
    //what you should call when the user clicks 'login'
    login: LoginOpsFn
    logout: LoginOpsFn
}

