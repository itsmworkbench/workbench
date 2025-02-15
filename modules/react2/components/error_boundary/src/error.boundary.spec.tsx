// ErrorBoundary.test.tsx
import React, {ReactNode} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ErrorReporter, ErrorReporterProvider} from "@itsmworkbench/react_utils";
import {UserData} from "@itsmworkbench/authentication";
import {TranslationContext, TranslationFn} from "@itsmworkbench/translation";
import {ErrorBoundary, makeErrorBoundary, SimpleErrorBoundary} from "./error.boundary";
import {ErrorBoundaryStyles} from "./defaultErrorBoundaryStyles";
import {UserDataProvider} from "@itsmworkbench/react_login_component";

// Problematic Component that throws an error
const ProblemChild: () => ReactNode = () => {
    throw new Error('Test error');
};

// Mock UserDataAccessor
const MockUserDataAccessor = ({
                                  children,
                                  isDev,
                              }: {
    children: ReactNode;
    isDev: boolean;
}) => {
    const mockUserData: UserData = {
        email: isDev ? 'me@example.com' : 'user@example.com',
        isDev: isDev,
        isAdmin: false,
        loggedIn: true,
    };
    return <UserDataProvider userData={mockUserData}>{children}</UserDataProvider>;
};

// Mock Translation
const mockTranslation: TranslationFn = (key: string) => `${key}_translated`;

// Error Reporters
const successfulErrorReporter: ErrorReporter = (errors: any) => {
    return Promise.resolve({errors, reference: 'ABC123'});
};

const failedErrorReporter: ErrorReporter = (errors: any) => {
    return Promise.reject(new Error('Reporting failed'));
};

const neverResolvingErrorReporter: ErrorReporter = (errors: any) => {
    return new Promise(() => {});
};

// User Data
const devUserData: UserData = {
    email: 'me@example.com',
    isDev: true,
    isAdmin: false,
    loggedIn: true,
};

const nonDevUserData: UserData = {
    email: 'user@example.com',
    isDev: false,
    isAdmin: false,
    loggedIn: true,
};

// Suppress console.error during tests
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

// Test Suite
describe('ErrorBoundary', () => {
    it('catches errors and displays reference number on successful reporting', async () => {
        render(
            <ErrorReporterProvider errorReporter={successfulErrorReporter}>
                <MockUserDataAccessor isDev={true}>
                    <TranslationContext.Provider value={mockTranslation}>
                        <SimpleErrorBoundary message="errors.mainErrorMessage">
                            <ProblemChild/>
                        </SimpleErrorBoundary>
                    </TranslationContext.Provider>
                </MockUserDataAccessor>
            </ErrorReporterProvider>
        );

        expect(await screen.findByText('errors.mainErrorMessage_translated')).toBeInTheDocument();
        expect(screen.getByText('errors.reference.message_translated:')).toBeInTheDocument();
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByText('error.details_translated')).toBeInTheDocument();

        fireEvent.click(screen.getByText('error.details_translated'));
        expect(screen.getByText(/Test error/)).toBeInTheDocument();
        expect(screen.getByText(/extras/)).toBeInTheDocument();
    });

    it('displays failure message when error reporting fails', async () => {
        render(
            <ErrorReporterProvider errorReporter={failedErrorReporter}>
                <MockUserDataAccessor isDev={false}>
                    <TranslationContext.Provider value={mockTranslation}>
                        <SimpleErrorBoundary message="errors.mainErrorMessage">
                            <ProblemChild/>
                        </SimpleErrorBoundary>
                    </TranslationContext.Provider>
                </MockUserDataAccessor>
            </ErrorReporterProvider>
        );

        expect(await screen.findByText('errors.mainErrorMessage_translated')).toBeInTheDocument();
        expect(await screen.findByText('errors.reference.failure_translated')).toBeInTheDocument();
        expect(screen.queryByText('errors.reference.message_translated:')).not.toBeInTheDocument();
        expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
    });

    it('displays loading message when error reporting is pending', async () => {
        render(
            <ErrorReporterProvider errorReporter={neverResolvingErrorReporter}>
                <MockUserDataAccessor isDev={false}>
                    <TranslationContext.Provider value={mockTranslation}>
                        <SimpleErrorBoundary message="errors.mainErrorMessage">
                            <ProblemChild/>
                        </SimpleErrorBoundary>
                    </TranslationContext.Provider>
                </MockUserDataAccessor>
            </ErrorReporterProvider>
        );

        expect(await screen.findByText('errors.mainErrorMessage_translated')).toBeInTheDocument();
        expect(screen.getByText('errors.reference.loading_translated')).toBeInTheDocument();
        expect(screen.queryByText('errors.reference.message_translated:')).not.toBeInTheDocument();
    });

    it('does not display detailed error information for non-developer users', async () => {
        render(
            <ErrorReporterProvider errorReporter={successfulErrorReporter}>
                <MockUserDataAccessor isDev={false}>
                    <TranslationContext.Provider value={mockTranslation}>
                        <SimpleErrorBoundary message="errors.mainErrorMessage">
                            <ProblemChild/>
                        </SimpleErrorBoundary>
                    </TranslationContext.Provider>
                </MockUserDataAccessor>
            </ErrorReporterProvider>
        );

        expect(await screen.findByText('errors.mainErrorMessage_translated')).toBeInTheDocument();
        expect(screen.getByText('errors.reference.message_translated:')).toBeInTheDocument();
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    });

    it('renders custom fallback UI when provided', async () => {
        const customFallback = <div data-testid="custom-fallback">Custom Fallback UI</div>;

        render(
            <ErrorReporterProvider errorReporter={successfulErrorReporter}>
                <UserDataProvider userData={nonDevUserData}>
                    <TranslationContext.Provider value={mockTranslation}>
                        <SimpleErrorBoundary
                            message="errors.mainErrorMessage"
                            fallback={customFallback}
                        >
                            <ProblemChild/>
                        </SimpleErrorBoundary>
                    </TranslationContext.Provider>
                </UserDataProvider>
            </ErrorReporterProvider>
        );

        expect(await screen.findByTestId('custom-fallback')).toBeInTheDocument();
        expect(screen.queryByText('errors.mainErrorMessage_translated')).not.toBeInTheDocument();
    });

    it('applies custom styles when provided via makeErrorBoundary', async () => {
        const customStyles: ErrorBoundaryStyles = {
            containerStyle: {border: '2px dashed blue'},
            strongStyle: {color: 'blue'},
        };

        const CustomErrorBoundary = makeErrorBoundary(customStyles);

        render(
            <ErrorReporterProvider errorReporter={successfulErrorReporter}>
                <MockUserDataAccessor isDev={true}>
                    <TranslationContext.Provider value={mockTranslation}>
                        <CustomErrorBoundary message="errors.mainErrorMessage">
                            <ProblemChild/>
                        </CustomErrorBoundary>
                    </TranslationContext.Provider>
                </MockUserDataAccessor>
            </ErrorReporterProvider>
        );

        expect(await screen.findByText('errors.mainErrorMessage_translated')).toBeInTheDocument();
        expect(screen.getByText('errors.reference.message_translated:')).toBeInTheDocument();
    });
});
