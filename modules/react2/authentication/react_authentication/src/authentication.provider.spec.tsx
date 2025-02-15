import {render, screen} from "@testing-library/react";
import React from "react";
import {AuthenticationProvider, LoginConfig, useLogin, UserDataProvider, useUserData} from "./authentication.provider";
import {DebugStateProvider} from "@itsmworkbench/react_utils";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';

// Helper to render with various configurations
function renderWithProviders(
    ui: React.ReactNode,
    {
        loginConfig,
        userData = {loggedIn: true, email: "test@example.com"},
    }: {
        loginConfig: any;
        userData?: any;
    }
) {
    return render(
        <DebugStateProvider debugState={{}}>
            <UserDataProvider userData={userData}>
                <AuthenticationProvider loginConfig={loginConfig}>
                    {ui}
                </AuthenticationProvider>
            </UserDataProvider>
        </DebugStateProvider>
    );
}

// Accessor for LoginOps
function LoginAccessor({children}: { children: (loginOps: any) => React.ReactNode }) {
    const loginOps = useLogin();
    return children(loginOps);
}

// Accessor for User Data
function UserDataAccessor({children}: { children: (userData: any) => React.ReactNode }) {
    const userData = useUserData();
    return children(userData);
}

describe("AuthenticationProvider", () => {
    const loginMock = jest.fn();
    const logoutMock = jest.fn();
    const refreshMock = jest.fn();
    const userDataGetter = jest.fn(() => ({loggedIn: true, email: "test@example.com"}));

    const loginConfig = {
        login: loginMock,
        logout: logoutMock,
        refreshLogin: refreshMock,
        userDataGetter,
    };

    it("provides login context to children", () => {
        renderWithProviders(
            <LoginAccessor>
                {(loginOps) => <div>Session Active</div>}
            </LoginAccessor>,
            {loginConfig}
        );

        expect(screen.getByText("Session Active")).toBeInTheDocument();
    });

    it("calls login, logout, and refreshLogin", async () => {
        renderWithProviders(
            <LoginAccessor>
                {(loginOps) => (
                    <>
                        <button onClick={() => loginOps.login()}>Login</button>
                        <button onClick={() => loginOps.logout()}>Logout</button>
                        <button onClick={() => loginOps.refreshLogin()}>Refresh</button>
                    </>
                )}
            </LoginAccessor>,
            {loginConfig}
        );

        await userEvent.click(screen.getByText("Login"));
        await userEvent.click(screen.getByText("Logout"));
        await userEvent.click(screen.getByText("Refresh"));

        expect(loginMock).toHaveBeenCalled();
        expect(logoutMock).toHaveBeenCalled();
        expect(refreshMock).toHaveBeenCalled();
    });

    it("throws when useLogin is used outside AuthenticationProvider", async () => {
        const TestComponent = () => {
            useLogin();
            return <div />;
        };

        // Act ensures React rendering is flushed properly
        await expect(async () => {
            await render(<TestComponent />);
        }).rejects.toThrow("s/w: useLogin must be used within a LoginProvider");
    });


    it("provides user data via useUserData", () => {
        const userData = {loggedIn: true, email: "test@example.com"} as any;

        render(
            <DebugStateProvider debugState={{}}>
                <UserDataProvider userData={userData}>
                    <UserDataAccessor>
                        {(userData) => <div>{userData.email}</div>}
                    </UserDataAccessor>
                </UserDataProvider>
            </DebugStateProvider>
        );

        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
    it("calls setUserData with updated user data when login is called", async () => {
        const setUserData = jest.fn();

        // Simulated loginConfig that calls setUserData directly
        const loginConfig = {
            login: (callback) => {
                setUserData({ loggedIn: true, email: "updated@example.com" });
                callback();
                return Promise.resolve();
            },
            userDataGetter: () => ({ loggedIn: true, email: "updated@example.com" }),
        } as any;  // We don't care about other methods for this test

        render(
            <DebugStateProvider debugState={{}}>
                <UserDataProvider userData={{ loggedIn: true, email: "test@example.com" } as any}>
                    <AuthenticationProvider loginConfig={loginConfig}>
                        <LoginAccessor>
                            {(loginOps) => <button onClick={() => loginOps.login()}>Login</button>}
                        </LoginAccessor>
                    </AuthenticationProvider>
                </UserDataProvider>
            </DebugStateProvider>
        );

        // Trigger login
        await userEvent.click(screen.getByText("Login"));

        // Assert setUserData was called with the correct updated user data
        expect(setUserData).toHaveBeenCalledWith({
            loggedIn: true,
            email: "updated@example.com",
        });
    });



    it("renders fallback content when user is logged out", () => {
        renderWithProviders(
            <UserDataAccessor>
                {(userData) =>
                    userData.loggedIn ? <div>Welcome</div> : <div>Please log in</div>
                }
            </UserDataAccessor>,
            {
                loginConfig,
                userData: {loggedIn: false, email: "guest@example.com"},
            }
        );

        expect(screen.getByText("Please log in")).toBeInTheDocument();
        expect(screen.queryByText("Welcome")).toBeNull();
    });
});
