import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button component', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByTestId('button');
    expect(btn).toHaveClass('primary');
  });

  it('applies secondary and danger variants', () => {
    render(<Button variant="secondary">Second</Button>);
    expect(screen.getByTestId('button')).toHaveClass('secondary');
    render(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger').closest('button')).toHaveClass('danger');
  });

  it('forwards extra className', () => {
    render(<Button className="extra">Extra</Button>);
    expect(screen.getByTestId('button')).toHaveClass('extra');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByText('Press'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        X
      </Button>
    );
    const btn = screen.getByText('X');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});