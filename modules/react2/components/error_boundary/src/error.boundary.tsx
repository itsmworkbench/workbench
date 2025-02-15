// ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { ErrorReporterContext, makeContextFor } from "@itsmworkbench/react_utils";
import { Errors } from "@itsmworkbench/errors";

import { TranslationContext, TranslationFn } from "@itsmworkbench/translation";
import { defaultErrorBoundaryStyles, ErrorBoundaryStyles } from "./defaultErrorBoundaryStyles";
import { UserData } from "@itsmworkbench/authentication";
import { UserDataAccessor } from "@itsmworkbench/react_login_component";

interface ErrorBoundaryProps {
    message: string;
    loadingReferenceMessage?: string;
    referenceFailureMessage?: string;
    referenceMessage?: string;
    fallback?: ReactNode;
    children: ReactNode;
}

export type ErrorBoundary = (props: ErrorBoundaryProps) => React.ReactElement;

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
    reference?: string;
    reportingFailed?: boolean;
    errors?: Errors;
    showStack?: boolean;
    showDetails?: boolean;
}

type ErrorBoundaryPropsWithStyles = ErrorBoundaryProps & { styles: ErrorBoundaryStyles };

export class ErrorBoundaryClass extends Component<ErrorBoundaryPropsWithStyles, ErrorBoundaryState> {
    static contextType = ErrorReporterContext;
    context!: React.ContextType<typeof ErrorReporterContext>;

    constructor(props: ErrorBoundaryPropsWithStyles) {
        super(props);
        this.state = { hasError: false, showStack: false };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const errorReporter = this.context;
        const errors: Errors = {
            errors: [`${this.props.message}: ${error.message}`],
            extras: { error, errorInfo }
        };
        this.setState({ errors });

        if (errorReporter) {
            errorReporter(errors)
                .then((reportedErrors) => {
                    if (reportedErrors.reference) {
                        this.setState({ reference: reportedErrors.reference });
                    } else {
                        this.setState({ reportingFailed: true });
                    }
                })
                .catch((err) => {
                    console.error("Failed to log error:", err, 'Error was', errors);
                    this.setState({ reportingFailed: true });
                });
        } else {
            console.error("ErrorReporter is not available in context.");
            this.setState({ reportingFailed: true });
        }
    }

    toggleStack = () => {
        this.setState((prevState) => ({ showStack: !prevState.showStack }));
    };
    toggleViewDetails = () => {
        this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
    };

    renderContent(userData: UserData, translation: TranslationFn) {
        const {
            styles = defaultErrorBoundaryStyles,
            message,
            loadingReferenceMessage = 'errors.reference.loading',
            referenceFailureMessage = 'errors.reference.failure',
            referenceMessage = 'errors.reference.message'
        } = this.props;

        if (this.state.hasError) {
            const { fallback } = this.props;
            const { reference, reportingFailed } = this.state;

            if (fallback) {
                return fallback;
            }

            return (
                <div
                    role="alert"
                    aria-live="assertive"
                    style={styles.containerStyle}
                >
                    <strong style={styles.strongStyle}>
                        {translation('error.title')}:
                    </strong> {translation(message)}

                    {reference && !reportingFailed && (
                        <div style={styles.referenceStyle}>
                            <p>
                                <strong style={styles.strongStyle}>
                                    {translation(referenceMessage)}:
                                </strong> {reference}
                            </p>
                        </div>
                    )}
                    {reportingFailed && (
                        <div style={styles.reportingFailedStyle}>
                            <p>{translation(referenceFailureMessage)}</p>
                        </div>
                    )}
                    {!reference && !reportingFailed && (
                        <div style={styles.referenceStyle}>
                            <p>{translation(loadingReferenceMessage)}</p>
                        </div>
                    )}

                    {userData.isDev && this.state.errors && (
                        <>
                            <div style={styles.detailsStyle}>
                                <details style={styles.detailsStyle}>
                                    <summary>{translation('error.details')}</summary>
                                    <pre>{JSON.stringify(this.state.errors, null, 2)}</pre>
                                </details>
                            </div>
                            <div style={styles.detailsStyle}>
                                <details style={styles.detailsStyle}>
                                    <summary>{translation('error.stacktrace')}</summary>
                                    <pre>{this.state.errors.extras.errorInfo.componentStack}</pre>
                                </details>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return this.props.children;
    }

    render() {
        return (
            <UserDataAccessor>
                {(userData) => (
                    <TranslationContext.Consumer>
                        {(translation) => this.renderContent(userData, translation)}
                    </TranslationContext.Consumer>
                )}
            </UserDataAccessor>
        );
    }
}

// Factory function to create ErrorBoundary with custom styles
export function makeErrorBoundary(customStyles: ErrorBoundaryStyles): ErrorBoundary {
    return function WrappedErrorBoundary(props: Omit<ErrorBoundaryProps, 'styles'>) {
        return <ErrorBoundaryClass {...props} styles={customStyles} />;
    };
}

// Default error boundary with default styles
export const SimpleErrorBoundary: ErrorBoundary = makeErrorBoundary(defaultErrorBoundaryStyles);

export const { use: useErrorBoundary, Provider: ErrorBoundaryProvider } =
    makeContextFor<ErrorBoundary, 'errorBoundary'>('errorBoundary', SimpleErrorBoundary);
