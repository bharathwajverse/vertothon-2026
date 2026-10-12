import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSubmissionForm } from './ProjectSubmissionForm';
import { isSubmissionDeadlinePassed } from '../../services/submissionService';
import { Submission } from '../../types';

describe('Project Submissions Unit & Integration Tests', () => {
  const mockSubmission: Submission = {
    id: 'sub-1',
    teamId: 'team-alpha',
    projectTitle: 'Vertofi Shield',
    summary: 'A decentralized security guardrail for smart contract execution with instant verification.',
    repoUrl: 'https://github.com/vertofi/shield',
    demoUrl: 'https://shield.vertofi.io',
    videoUrl: 'https://youtube.com/watch?v=12345',
    track: 'Web3',
    techStack: ['Solidity', 'TypeScript', 'React'],
    status: 'draft',
    createdAt: '2026-10-12T00:00:00Z',
  };

  it('verifies that the submission deadline is set in the future (Nov 15, 2026)', () => {
    // Current test date is October 2026; deadline is Nov 15 2026
    expect(isSubmissionDeadlinePassed()).toBe(false);
  });

  it('renders submission fields with initial project values', () => {
    render(
      <ProjectSubmissionForm
        teamId="team-alpha"
        initialData={mockSubmission}
        isLeader={true}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Vertofi Shield')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://github.com/vertofi/shield')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://shield.vertofi.io')).toBeInTheDocument();
    expect(screen.getByText('Draft in Progress')).toBeInTheDocument();
  });

  it('validates project title and minimum summary length before submission', async () => {
    const user = userEvent.setup();
    const mockSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ProjectSubmissionForm
        teamId="team-alpha"
        initialData={null}
        isLeader={true}
        onSave={mockSave}
      />
    );

    const titleInput = screen.getByLabelText(/Project Title/i);
    const summaryInput = screen.getByLabelText(/Executive Summary/i);
    const repoInput = screen.getByLabelText(/Repository URL/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Final Deliverable/i });

    // Submit with empty fields
    await user.click(submitBtn);
    expect(screen.getByText(/Project title is required/i)).toBeInTheDocument();
    expect(mockSave).not.toHaveBeenCalled();

    // Fill title but too short summary
    await user.type(titleInput, 'Vertofi Pay');
    await user.type(summaryInput, 'Too short');
    await user.type(repoInput, 'https://github.com/vertofi/pay');
    await user.click(submitBtn);
    expect(screen.getByText(/summary of at least 20 characters/i)).toBeInTheDocument();

    // Fill valid summary
    await user.clear(summaryInput);
    await user.type(
      summaryInput,
      'This is a comprehensive cross-chain settlement protocol for financial institutions.'
    );
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          projectTitle: 'Vertofi Pay',
          repoUrl: 'https://github.com/vertofi/pay',
        }),
        true // isFinalSubmit = true
      );
    });
  });

  it('disables modification inputs when user is not the team leader', () => {
    render(
      <ProjectSubmissionForm
        teamId="team-alpha"
        initialData={mockSubmission}
        isLeader={false}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Only your team leader can submit or edit final project deliverables/i)
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Vertofi Shield')).toBeDisabled();
    expect(screen.getByDisplayValue('https://github.com/vertofi/shield')).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Submit Final Deliverable/i })).not.toBeInTheDocument();
  });
});
