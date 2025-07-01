import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal component', () => {
  const defaultProps = {
    onClose: jest.fn(),
    title: 'Test Modal',
    footer: <button>OK</button>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    render(
      <Modal {...defaultProps} isOpen={false}>
        <div data-testid="child">Should not see me</div>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('renders header, body, and footer when isOpen is true', () => {
    render(
      <Modal {...defaultProps} isOpen={true}>
        <p>Body Content</p>
      </Modal>
    );
    // Header
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    // Body
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    // Footer
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  test('calls onClose when clicking the close button', () => {
    render(
      <Modal {...defaultProps} isOpen={true}>
        <p>Body Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // --- New tests below ---

  test('Invite Preview: shows a list of pending invites', () => {
    const invites = [
      'alice@example.com',
      'bob@example.com',
      'carol@example.com',
    ];
    render(
      <Modal {...defaultProps} isOpen={true} title="Pending Invites">
        <ul>
          {invites.map(email => (
            <li key={email}>{email}</li>
          ))}
        </ul>
      </Modal>
    );
    // Header
    expect(screen.getByText('Pending Invites')).toBeInTheDocument();
    // Each invite
    invites.forEach(email => {
      expect(screen.getByText(email)).toBeInTheDocument();
    });
  });

  test('Organization Selection: renders radio options and allows selection', () => {
    const orgs = [
      { id: 'org1', name: 'Org One' },
      { id: 'org2', name: 'Org Two' },
      { id: 'org3', name: 'Org Three' },
    ];
    const SelectionList = ({
      onSelect,
    }: {
      onSelect: (id: string) => void
    }) => (
      <div role="radiogroup" aria-label="Select Org">
        {orgs.map(({ id, name }) => (
          <label key={id}>
            <input
              type="radio"
              name="orgSelect"
              value={id}
              onChange={() => onSelect(id)}
            />
            {name}
          </label>
        ))}
      </div>
    );

    const handleSelect = jest.fn();
    render(
      <Modal {...defaultProps} isOpen={true} title="Select Organization">
        <SelectionList onSelect={handleSelect} />
      </Modal>
    );

    // Ensure all org labels are rendered
    orgs.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    // Simulate selecting the second org
    fireEvent.click(screen.getByLabelText('Org Two'));
    expect(handleSelect).toHaveBeenCalledWith('org2');
  });
});