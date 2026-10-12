import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  calculateTotalScore,
  saveProjectEvaluation,
  getSavedEvaluations,
  getSubmissionAverageScore,
} from '../../services/judgingService';
import { ProjectScoringModal } from './ProjectScoringModal';
import { Submission } from '../../types';

describe('Judging & Scoring Engine Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('calculateTotalScore helper', () => {
    it('sums all 4 rubric criteria out of 100', () => {
      const score = calculateTotalScore({
        innovation: 25,
        technical: 20,
        impact: 22,
        design: 18,
      });
      expect(score).toBe(85);
    });
  });

  describe('saveProjectEvaluation & averaging', () => {
    it('saves judge scores and computes submission average score', () => {
      saveProjectEvaluation('sub-1', 'judge-1', 'Judge Ada', {
        innovation: 20,
        technical: 20,
        impact: 20,
        design: 20,
      }); // Total: 80

      saveProjectEvaluation('sub-1', 'judge-2', 'Judge Turing', {
        innovation: 25,
        technical: 25,
        impact: 20,
        design: 20,
      }); // Total: 90

      const evals = getSavedEvaluations();
      expect(evals).toHaveLength(2);

      const stats = getSubmissionAverageScore('sub-1');
      expect(stats.count).toBe(2);
      expect(stats.average).toBe(85); // (80 + 90) / 2
    });
  });

  describe('ProjectScoringModal Component', () => {
    const mockSubmission: Submission = {
      id: 'sub-alpha',
      teamId: 'team-1',
      projectTitle: 'Vertofi Liquidity Protocol',
      summary: 'Automated market making for decentralized bonds.',
      repoUrl: 'https://github.com/vertofi/amm',
      track: 'FinTech',
      techStack: ['Rust', 'React'],
      status: 'submitted',
      createdAt: '2026-10-12T00:00:00Z',
    };

    it('renders 4 rubric criteria and calculates total score in modal', async () => {
      render(
        <ProjectScoringModal
          submission={mockSubmission}
          judgeId="judge-ada"
          judgeName="Judge Ada"
          onClose={() => {}}
          onSaved={() => {}}
        />
      );

      expect(screen.getByText(/Score Submission: Vertofi Liquidity Protocol/i)).toBeInTheDocument();
      expect(screen.getByText(/Innovation & Originality/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical Execution/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-World Impact/i)).toBeInTheDocument();
      expect(screen.getByText(/User Experience & Presentation/i)).toBeInTheDocument();

      // Default sum: 18 * 4 = 72
      expect(screen.getByText(/72/i)).toBeInTheDocument();
    });
  });
});
