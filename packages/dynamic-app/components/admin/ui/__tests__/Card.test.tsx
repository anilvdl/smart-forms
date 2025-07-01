import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card component', () => {
  test('renders children', () => {
    render(
      <Card>
        <p data-testid="body">Hello Card</p>
      </Card>
    );
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });

  test('renders title when provided', () => {
    render(<Card title="My Title">Content</Card>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  test('renders footer when provided', () => {
    render(<Card footer={<button>OK</button>}>Content</Card>);
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  test('applies extra className', () => {
    render(<Card className="extra">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('extra');
  });
});