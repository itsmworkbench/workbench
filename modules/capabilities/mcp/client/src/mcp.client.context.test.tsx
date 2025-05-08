import * as React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { McpClientProvider, useMcpClient } from "./mcp.client.context";

jest.mock("@modelcontextprotocol/sdk/dist/esm/client/index", () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue(undefined),
        })),
    };
});

// Dummy component that uses the context
const TestComponent = () => {
    const { connected, emailClient, sqlClient } = useMcpClient();
    return (
        <div>
            <p data-testid="connected">{connected ? "true" : "false"}</p>
            <p data-testid="emailClient">{emailClient ? "defined" : "undefined"}</p>
            <p data-testid="sqlClient">{sqlClient ? "defined" : "undefined"}</p>
        </div>
    );
};

describe("McpClientProvider", () => {
    it("provides context with connected clients", async () => {
        render(
            <McpClientProvider>
                <TestComponent />
            </McpClientProvider>
        );

        // Wait for connection to resolve
        await waitFor(() =>
            expect(screen.getByTestId("connected").textContent).toBe("true")
        );

        expect(screen.getByTestId("emailClient").textContent).toBe("defined");
        expect(screen.getByTestId("sqlClient").textContent).toBe("defined");
    });

    it("throws error if used outside provider", () => {
        // Suppress expected error log
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        const BrokenComponent = () => {
            useMcpClient();
            return null;
        };

        expect(() => render(<BrokenComponent />)).toThrow(
            "useMcpClient must be used within McpClientProvider"
        );
        consoleSpy.mockRestore();
    });
});
