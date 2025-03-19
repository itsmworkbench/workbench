import {LensAndPath, lensBuilder} from "@itsmworkbench/optics";
import {PhaseItem, PhaseStatus, PhaseTc, ProgressDisplay} from "./phase.progress";
import {simplePhaseDisplays} from "./simplePhaseDisplay";
import {NameAnd} from "@itsmworkbench/utils";
// ProgressDisplay.test.tsx
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {RawThemeProvider} from "@itsmworkbench/themes";
import {itsmTheme} from "@itsmworkbench/itsm_themes";

type SamplePhases = {
    phase1a: PhaseStatus
    phase1b: PhaseStatus
    phase2a: PhaseStatus
    phase2b: PhaseStatus
    phase3: PhaseStatus
    phase4: PhaseStatus
}

const lb = lensBuilder<SamplePhases>()
const phase1L: LensAndPath<SamplePhases, PhaseItem> = lb.focusCompose({
    onea: lb.focusOn('phase1a'),
    oneb: lb.focusOn('phase1b')
})
const phase2L = lb.focusCompose({
    twoa: lb.focusOn('phase2a'),
    twob: lb.focusOn('phase2b')
})
const phase3L = lb.focusCompose({phase3: lb.focusOn('phase3')})
const phase4L = lb.focusCompose({phase4: lb.focusOn('phase4')})

const lensLookup: NameAnd<LensAndPath<SamplePhases, PhaseItem>> = {
    phase1: phase1L,
    phase2: phase2L,
    phase3: phase3L,
    phase4: phase4L
}

const samplePhaseTc: PhaseTc<SamplePhases> = {
    ...simplePhaseDisplays(),
    phases: () => ['phase1', 'phase2', 'phase3', 'phase4'],
    lens: phase => lensLookup[phase]
}

const renderWithTheme = (ui: React.ReactElement) => {
    return render(<RawThemeProvider theme={itsmTheme}>{ui}</RawThemeProvider>);
};

describe('ProgressDisplay', () => {
    // Sample data that corresponds to our lens test fixture.
    const sampleData: SamplePhases = {
        phase1a: 'completed',
        phase1b: 'completed',
        phase2a: 'in-progress',
        phase2b: 'waiting',
        phase3: 'failed',
        phase4: 'waiting'
    };

    test('renders all phases and arrow icons correctly', () => {
        renderWithTheme(<ProgressDisplay data={sampleData} phaseTc={samplePhaseTc} />);

        // Composite phases: check container and subphase elements.
        const phase1Container = screen.getByTestId('phase-status-phase1');
        expect(phase1Container).toBeInTheDocument();
        expect(screen.getByTestId('phase-substatus-onea')).toBeInTheDocument();
        expect(screen.getByTestId('phase-substatus-oneb')).toBeInTheDocument();

        const phase2Container = screen.getByTestId('phase-status-phase2');
        expect(phase2Container).toBeInTheDocument();
        expect(screen.getByTestId('phase-substatus-twoa')).toBeInTheDocument();
        expect(screen.getByTestId('phase-substatus-twob')).toBeInTheDocument();

        // Simple phases: the container's test id is the phase name.
        expect(screen.getByTestId('phase-status-phase3')).toBeInTheDocument();
        expect(screen.getByTestId('phase-status-phase4')).toBeInTheDocument();

        // Check that arrow icons (rendered as "→") appear between the 4 main phase groups.
        const arrows = screen.getAllByText('→');
        expect(arrows).toHaveLength(3);
    });

    test('applies correct status styles via lookup', () => {
        renderWithTheme(<ProgressDisplay data={sampleData} phaseTc={samplePhaseTc} />);

        // For composite phase1: both onea and oneb are 'completed' -> expect lightgreen.
        expect(screen.getByTestId('phase-substatus-onea')).toHaveStyle('background-color: lightgreen');
        expect(screen.getByTestId('phase-substatus-oneb')).toHaveStyle('background-color: lightgreen');

        // For composite phase2: twoa is 'in-progress' (lightblue) and twob is 'waiting' (lightgray).
        expect(screen.getByTestId('phase-substatus-twoa')).toHaveStyle('background-color: lightblue');
        expect(screen.getByTestId('phase-substatus-twob')).toHaveStyle('background-color: lightgray');

        // For simple phase3: expect 'failed' -> salmon.
        expect(screen.getByTestId('phase-substatus-phase3')).toHaveStyle('background-color: salmon');

        // For simple phase4: expect 'waiting' -> lightgray.
        expect(screen.getByTestId('phase-substatus-phase4')).toHaveStyle('background-color: lightgray');
    });

    test('renders correct text for composite sub-phases', () => {
        renderWithTheme(<ProgressDisplay data={sampleData} phaseTc={samplePhaseTc} />);

        // Verify text for composite sub-phases.
        expect(screen.getByTestId('phase-substatus-onea')).toHaveTextContent('onea: completed');
        expect(screen.getByTestId('phase-substatus-oneb')).toHaveTextContent('oneb: completed');
        expect(screen.getByTestId('phase-substatus-twoa')).toHaveTextContent('twoa: in-progress');
        expect(screen.getByTestId('phase-substatus-twob')).toHaveTextContent('twob: waiting');

        // For simple phases, expect "phase: status" format.
        expect(screen.getByTestId('phase-status-phase3')).toHaveTextContent('phase3: failed');
        expect(screen.getByTestId('phase-status-phase4')).toHaveTextContent('phase4: waiting');
    });
});
