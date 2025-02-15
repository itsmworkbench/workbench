import { render, screen } from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";

import { DebugStateProvider } from "@itsmworkbench/react_utils";
import { AuthenticateContextData, LoginContext, UserDataProvider } from "./authentication.provider";
import { SimpleDisplayLogin, SimpleNotLoggedIn } from "./simple.login";

// Helper to render with necessary providers
function renderWithProviders(
    ui: React.ReactNode,
    userData = { loggedIn: false, email: '' } as any,
    loginMock = jest.fn(),
    logoutMock = jest.fn()
) {
    const authenticateContextData: AuthenticateContextData = {
        sessionId: "test",
        loginOps: {
            login: loginMock,
            logout: logoutMock,
            refreshLogin: jest.fn(),
        },
        userDataGetter: () => userData,
    };
    return render(
        <DebugStateProvider debugState={{}}>
            <LoginContext.Provider value={authenticateContextData}>
                <UserDataProvider userData={userData}>
                    {ui}
                </UserDataProvider>
            </LoginContext.Provider>
        </DebugStateProvider>
    );
}

describe("SimpleDisplayLogin", () => {
    it("renders login button when not logged in", () => {
        renderWithProviders(<SimpleDisplayLogin />);
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("renders logout button and email when logged in", () => {
        renderWithProviders(<SimpleDisplayLogin />, {
            loggedIn: true,
            email: "user@example.com",
            isAdmin: false,
            isDev: false,
        });
        expect(screen.getByText("Logged in as user@example.com")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("triggers login when login button is clicked", async () => {
        const loginMock = jest.fn();
        renderWithProviders(<SimpleDisplayLogin />, { loggedIn: false }, loginMock);

        const loginButton = screen.getByText("Login");
        await userEvent.click(loginButton);

        expect(loginMock).toHaveBeenCalledTimes(1);
    });

    it("triggers logout when logout button is clicked", async () => {
        const logoutMock = jest.fn();
        renderWithProviders(<SimpleDisplayLogin />, {
            loggedIn: true,
            email: "user@example.com",
        }, jest.fn(), logoutMock);

        const logoutButton = screen.getByText("Logout");
        await userEvent.click(logoutButton);

        expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    it("renders admin and dev labels when applicable", () => {
        renderWithProviders(<SimpleDisplayLogin />, {
            loggedIn: true,
            email: "admin@example.com",
            isAdmin: true,
            isDev: true,
        });
        expect(screen.getByText("Logged in as admin@example.com - Admin - Dev")).toBeInTheDocument();
    });
});

describe("SimpleNotLoggedIn", () => {
    it("throws error when rendered while logged in", () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => renderWithProviders(<SimpleNotLoggedIn />, {
            loggedIn: true
        }))
            .toThrow("s/w: Must not be logged in to use SimpleNotLoggedIn");

        consoleErrorMock.mockRestore();
    });

    it("renders UI for not logged-in users", () => {
        renderWithProviders(<SimpleNotLoggedIn />, {
            loggedIn: false
        });
        expect(screen.getByText("Must be logged in")).toBeInTheDocument();
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("triggers login when login button is clicked (SimpleNotLoggedIn)", async () => {
        const loginMock = jest.fn();
        renderWithProviders(<SimpleNotLoggedIn />, {
            loggedIn: false
        }, loginMock);

        const loginButton = screen.getByText("Login");
        await userEvent.click(loginButton);

        expect(loginMock).toHaveBeenCalledTimes(1);
    });
});
