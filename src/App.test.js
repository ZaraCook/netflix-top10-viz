import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText(/Overview/i)).toBeInTheDocument();
  expect(screen.getByText(/Title Explorer/i)).toBeInTheDocument();
  expect(screen.getByText(/Compare/i)).toBeInTheDocument();
});
