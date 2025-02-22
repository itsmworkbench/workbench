import {render, screen} from "@testing-library/react";
import React from "react";
import {LoginContext, UserDataProvider} from "./authentication.provider";
import {Authenticate, MustBeLoggedIn} from "./authenticate";
import '@testing-library/jest-dom';
import {LoginComponentsProvider} from "./react.login";
import {DebugStateProvider} from "@itsmworkbench/react_utils";

function renderWithProviders(
    ui: React.ReactNode,
    {
        sessionId = "test-session",
        refreshLogin = () => Promise.resolve(),
        userData = {loggedIn: true, email: "test@example.com", isDev: false, isAdmin: false},
        _refreshLogin = (refreshLogin: () => Promise<void>) => refreshLogin,
        NotLoggedIn = () => <div>Please log in</div>,  // Injected component
    }: {
        sessionId?: string;
        refreshLogin?: () => Promise<void>;
        userData?: any;
        _refreshLogin?: (refreshLogin: () => Promise<void>) => () => Promise<void>;
        NotLoggedIn?: React.FC;
    } = {}
) {
    return render(
        <DebugStateProvider debugState={{}}>
            <LoginContext.Provider value={{sessionId, loginOps: {refreshLogin} as any, userDataGetter: () => userData}}>
                <UserDataProvider userData={userData}>
                    <LoginComponentsProvider loginComponents={{NotLoggedIn} as any}>
                        <Authenticate _refreshLogin={_refreshLogin}>
                            <div>Content</div>
                        </Authenticate>
                    </LoginComponentsProvider>
                </UserDataProvider>
            </LoginContext.Provider>
        </DebugStateProvider>
    );
}

describe("Authenticate", () => {
    it("calls refreshLogin immediately on mount", async () => {
        let called = false;
        const refreshLogin = () => {
            called = true;
            return Promise.resolve();
        };

        renderWithProviders(<div/>, {refreshLogin});

        expect(called).toBe(true);
        expect(await screen.findByText("Content")).toBeInTheDocument();
    });

    it("renders NotLoggedIn when user is not logged in", async () => {
        const NotLoggedIn = () => <div>Please log in</div>;

        renderWithProviders(<div/>, {
            userData: {loggedIn: false, email: "guest@example.com", isDev: false, isAdmin: false},
            _refreshLogin: () => () => Promise.resolve(),
        });

        expect(await screen.findByText("Please log in")).toBeInTheDocument();
    });

    it("renders children when user is logged in", async () => {
        renderWithProviders(<div/>);

        expect(await screen.findByText("Content")).toBeInTheDocument();
    });

    it("handles refreshLogin errors gracefully", async () => {
        const failingRefresh = () => Promise.reject(new Error("Refresh failed"));

        renderWithProviders(<div/>, {refreshLogin: failingRefresh});

        // Match partial text even if broken across nodes
        expect(await screen.findByText(/Refresh failed/i)).toBeInTheDocument();
    });

    it("injects a refresh function that never resolves", async () => {
        const neverResolves = () => new Promise<void>(() => {});

        renderWithProviders(<div/>, {refreshLogin: neverResolves});

        // Test hangs unless handled properly in LoadingOr, which should ideally time out or show a loading spinner.
        expect(screen.queryByText("Content")).toBeNull();
    });
});

// Helper to render with different user states
function renderWithUserState(
    loggedIn: boolean,
    children: React.ReactNode,
    renderNotLoggedInText: string = "Please log in"
) {
    const userData = {loggedIn, email: "test@example.com", isDev: false, isAdmin: false};

    return render(
        <DebugStateProvider debugState={{}}>
            <UserDataProvider userData={userData}>
                <MustBeLoggedIn renderNotLoggedIn={() => <div>{renderNotLoggedInText}</div>}>
                    {children}
                </MustBeLoggedIn>
            </UserDataProvider>
        </DebugStateProvider>
    );
}

describe("MustBeLoggedIn", () => {
    it("renders children when the user is logged in", () => {
        renderWithUserState(true, <div>Protected Content</div>);

        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("renders the renderNotLoggedIn component when the user is not logged in", () => {
        renderWithUserState(false, <div>Protected Content</div>, "Access Denied");

        expect(screen.getByText("Access Denied")).toBeInTheDocument();
        expect(screen.queryByText("Protected Content")).toBeNull();
    });
});
