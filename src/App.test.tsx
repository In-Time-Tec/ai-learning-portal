import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Interactive AI 101 Module heading', () => {
  render(<App />);
  const linkElement = screen.getByText(/Interactive AI 101 Module/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders description text', () => {
  render(<App />);
  const descriptionElement = screen.getByText(/Learn AI concepts with role-specific context/i);
  expect(descriptionElement).toBeInTheDocument();
});