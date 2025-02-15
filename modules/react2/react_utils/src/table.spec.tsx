import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { SimpleTable } from "./table";

interface User {
    id: number;
    name: string;
    email: string;
}

const userData: User[] = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
];

const titles = ["ID", "Name", "Email"];
const keys = ["id", "name", "email"] as (keyof User)[];

describe("SimpleTable component", () => {
    test("renders table with data correctly", () => {
        render(<SimpleTable titles={titles} data={userData} keys={keys} />);

        // Check headers
        titles.forEach((title) => {
            expect(screen.getByText(title)).toBeInTheDocument();
        });

        // Check data rows
        userData.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
            expect(screen.getByText(user.id.toString())).toBeInTheDocument();
        });

        // Verify table structure
        expect(screen.getAllByRole("row")).toHaveLength(userData.length + 1);  // +1 for header row
    });

    test("renders noDataText when data is empty", () => {
        render(
            <SimpleTable
                titles={titles}
                data={[]}
                keys={keys}
                noDataText="No users found"
            />
        );

        // Verify the "no data" message is displayed
        expect(screen.getByText("No users found")).toBeInTheDocument();

        // Ensure it spans all columns
        const noDataCell = screen.getByText("No users found").closest('td');
        expect(noDataCell).toHaveAttribute("colspan", titles.length.toString());
    });

    test("renders default no data message if noDataText is not provided", () => {
        render(
            <SimpleTable
                titles={titles}
                data={[]}
                keys={keys}
            />
        );

        // Check for default "No data available" message
        expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    test("renders correct number of columns", () => {
        render(<SimpleTable titles={titles} data={userData} keys={keys} />);
        const headers = screen.getAllByRole("columnheader");
        expect(headers).toHaveLength(titles.length);
    });


});
