import {cleanup, render, screen, waitFor} from "@testing-library/react";
import {LoadingOr} from "./loadingOr";
import React from "react";
import "@testing-library/jest-dom";
/**
 * @jest-environment jsdom
 */
describe("LoadingOr", () => {
    afterEach(cleanup);

    it("renders loading state", () => {
        const unresolvedKleisli = () => new Promise<string>(() => {});
        render(
            <LoadingOr
                input={1}
                kleisli={unresolvedKleisli}
                Loading={() => <div>Loading...</div>}
            >
                {(data) => <div>Data: {data}</div>}
            </LoadingOr>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders error state", async () => {
        const errorKleisli = () => Promise.reject(new Error("Fetch failed"));
        render(
            <LoadingOr
                input={1}
                kleisli={errorKleisli}
                Error={({error}) => <div>Error: {error}</div>}>
                {(data) => <div>Data: {data}</div>}
            </LoadingOr>
        );

        await waitFor(() => {
            expect(screen.getByText("Error: Fetch failed")).toBeInTheDocument();
        });
    });

    it("renders data state", async () => {
        const resolvedKleisli = (input: number) => Promise.resolve(`Resolved: ${input}`);
        render(
            <LoadingOr
                input={1}
                kleisli={resolvedKleisli}
            >
                {(data) => <div>Data: {data}</div>}
            </LoadingOr>
        );

        await waitFor(() => {
            expect(screen.getByText("Data: Resolved: 1")).toBeInTheDocument();
        });
    });

    it("calls onUnmount with data when unmounted", async () => {
        const resolvedKleisli = (input: number) => Promise.resolve(`Resolved: ${input}`);
        const onUnmount = jest.fn();

        const {unmount} = render(
            <LoadingOr
                input={1}
                kleisli={resolvedKleisli}
                onUnmount={onUnmount}
            >
                {(data) => <div>Data: {data}</div>}
            </LoadingOr>
        );

        await waitFor(() => {
            expect(screen.getByText("Data: Resolved: 1")).toBeInTheDocument();
        });

        unmount();

        expect(onUnmount).toHaveBeenCalledWith("Resolved: 1");
    });
});
