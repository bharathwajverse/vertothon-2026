import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { Toast } from './Toast';
import { SelectDropdown } from './SelectDropdown';
import { DataTable, ColumnDef } from './DataTable';

describe('Shared UI Components Library', () => {
  describe('Button Component', () => {
    it('renders with children and responds to click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Submit Registration</Button>);
      const button = screen.getByRole('button', { name: /Submit Registration/i });
      expect(button).toBeInTheDocument();

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button and prevents click when disabled or loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <Button onClick={handleClick} disabled>
          Disabled Action
        </Button>
      );
      const button = screen.getByRole('button', { name: /Disabled Action/i });
      expect(button).toBeDisabled();

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();

      // Test loading state
      rerender(
        <Button onClick={handleClick} isLoading>
          Loading Action
        </Button>
      );
      const loadingButton = screen.getByRole('button', { name: /Loading Action/i });
      expect(loadingButton).toBeDisabled();
      expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Badge Component', () => {
    it('renders text with appropriate variant classes and optional indicator dot', () => {
      render(
        <Badge variant="success" dot data-testid="test-badge">
          Approved
        </Badge>
      );
      const badge = screen.getByTestId('test-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-emerald-50');
      expect(badge).toHaveTextContent('Approved');
    });

    it('renders different status variants correctly', () => {
      const { rerender } = render(
        <Badge variant="warning" data-testid="status-badge">
          Waitlist
        </Badge>
      );
      expect(screen.getByTestId('status-badge')).toHaveClass('bg-amber-50');

      rerender(
        <Badge variant="danger" data-testid="status-badge">
          Rejected
        </Badge>
      );
      expect(screen.getByTestId('status-badge')).toHaveClass('bg-rose-50');

      rerender(
        <Badge variant="info" data-testid="status-badge">
          Reviewing
        </Badge>
      );
      expect(screen.getByTestId('status-badge')).toHaveClass('bg-brand-50');
    });
  });

  describe('Modal Component', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Dialog">
          Modal Content
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders title, children, and responds to confirmation and close actions', async () => {
      const handleClose = vi.fn();
      const handleConfirm = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Confirm Team Registration"
          description="Are you sure you want to lock this roster?"
          confirmLabel="Lock Roster"
        >
          <p>Roster details cannot be edited past cutoff.</p>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Team Registration')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to lock this roster?')).toBeInTheDocument();

      // Test confirm button click
      const confirmButton = screen.getByRole('button', { name: /Lock Roster/i });
      await user.click(confirmButton);
      expect(handleConfirm).toHaveBeenCalledTimes(1);

      // Test close button
      const closeButton = screen.getByRole('button', { name: /Close dialog/i });
      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Escape Test">
          Content
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Toast Component', () => {
    it('renders alert notification and calls onDismiss when close button is clicked', async () => {
      const handleDismiss = vi.fn();
      const user = userEvent.setup();

      render(
        <Toast
          toast={{
            id: 't-1',
            type: 'success',
            title: 'Roster Updated',
            message: 'New member successfully joined.',
            duration: 0,
          }}
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Roster Updated')).toBeInTheDocument();
      expect(screen.getByText('New member successfully joined.')).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /Dismiss notification/i });
      await user.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledWith('t-1');
    });
  });

  describe('SelectDropdown Component', () => {
    it('renders options, changes value, and displays error or helper text', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      const options = [
        { value: 'ai', label: 'Artificial Intelligence' },
        { value: 'fintech', label: 'Fintech & Payments' },
        { value: 'web3', label: 'Web3 & Identity' },
      ];

      const { rerender } = render(
        <SelectDropdown
          label="Track Selection"
          options={options}
          value="ai"
          onChange={handleChange}
          helperText="Select primary track"
        />
      );

      expect(screen.getByLabelText(/Track Selection/i)).toBeInTheDocument();
      expect(screen.getByText('Select primary track')).toBeInTheDocument();

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'fintech');
      expect(handleChange).toHaveBeenCalledWith('fintech');

      // Test error display
      rerender(
        <SelectDropdown
          label="Track Selection"
          options={options}
          value="ai"
          onChange={handleChange}
          error="Track selection is required"
        />
      );
      expect(screen.getByText('Track selection is required')).toBeInTheDocument();
    });
  });

  describe('DataTable Component', () => {
    interface TestItem {
      id: string;
      name: string;
      track: string;
    }

    const columns: ColumnDef<TestItem>[] = [
      { key: 'name', header: 'Team Name' },
      { key: 'track', header: 'Track' },
    ];

    const data: TestItem[] = [
      { id: '1', name: 'Alpha Builders', track: 'AI' },
      { id: '2', name: 'FinForge', track: 'Fintech' },
    ];

    it('renders tabular data correctly', () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={(row) => row.id}
        />
      );

      expect(screen.getByText('Team Name')).toBeInTheDocument();
      expect(screen.getByText('Alpha Builders')).toBeInTheDocument();
      expect(screen.getByText('FinForge')).toBeInTheDocument();
    });

    it('renders loading state when isLoading is true', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          isLoading={true}
        />
      );

      expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();
    });

    it('renders empty message when data is empty and not loading', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          keyExtractor={(row) => row.id}
          emptyMessage="No teams currently registered."
        />
      );

      expect(screen.getByText('No teams currently registered.')).toBeInTheDocument();
    });
  });
});
