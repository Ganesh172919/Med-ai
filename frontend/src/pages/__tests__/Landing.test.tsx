import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Landing from '../Landing';

function renderLanding() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/landing']}>
        <Landing />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Landing page', () => {
  it('renders the hero heading', () => {
    renderLanding();
    expect(screen.getByText('Think deeper.')).toBeInTheDocument();
    expect(screen.getByText('Chat smarter.')).toBeInTheDocument();
  });

  it('renders the CTA buttons', () => {
    renderLanding();
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderLanding();
    expect(screen.getByText('Deep Reasoning')).toBeInTheDocument();
    expect(screen.getByText('Solo AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Group Rooms')).toBeInTheDocument();
  });

  it('renders the getting started section', () => {
    renderLanding();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Start Chatting')).toBeInTheDocument();
    expect(screen.getByText('Collaborate')).toBeInTheDocument();
  });

  it('renders the CTA section', () => {
    renderLanding();
    expect(screen.getByText('Ready to think deeper?')).toBeInTheDocument();
    expect(screen.getByText('Start for Free')).toBeInTheDocument();
  });

  it('renders social proof badges', () => {
    renderLanding();
    expect(screen.getByText('Open Source')).toBeInTheDocument();
    expect(screen.getByText('MongoDB Backed')).toBeInTheDocument();
  });

  it('renders the AI providers badge', () => {
    renderLanding();
    expect(screen.getByText('Multi-provider AI gateway')).toBeInTheDocument();
  });

  it('renders stats', () => {
    renderLanding();
    expect(screen.getByText('AI Providers')).toBeInTheDocument();
    expect(screen.getByText('AI Models')).toBeInTheDocument();
  });

  it('renders the ChatSphere brand in Navbar', () => {
    renderLanding();
    expect(screen.getByText('ChatSphere')).toBeInTheDocument();
  });
});
