import { render, screen } from '@testing-library/react';

describe('Smoke test', () => {
  it('renders without crashing', () => {
    render(<div>Hello, test!</div>);
    expect(screen.getByText('Hello, test!')).toBeInTheDocument();
  });
});
