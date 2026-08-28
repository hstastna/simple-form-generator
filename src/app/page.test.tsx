import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Home from './page';

describe('Home', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    render(<Home />, { container });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders the tab navigation', async () => {
    await waitFor(() => {
      expect(
        screen.getByRole('tablist', { name: 'Form Generator Tabs' })
      ).toBeTruthy();
    });
  });

  it('renders the initial active tab', async () => {
    await waitFor(() => {
      const activeTab = screen.getByRole('tab', { selected: true });

      expect(activeTab.textContent).toBe('config');
    });
  });

  it('changes active tab on click', async () => {
    const configTab = screen.getByText('config');
    const resultTab = screen.getByText('result');

    fireEvent.click(resultTab);

    await waitFor(() => {
      expect(resultTab.getAttribute('aria-selected')).toBe('true');
      expect(configTab.getAttribute('aria-selected')).toBe('false');
    });

    fireEvent.click(configTab);

    await waitFor(() => {
      expect(configTab.getAttribute('aria-selected')).toBe('true');
      expect(resultTab.getAttribute('aria-selected')).toBe('false');
    });
  });

  it('renders the correct tab content', async () => {
    const configTab = screen.getByText('config');
    const resultTab = screen.getByText('result');

    fireEvent.click(resultTab);

    await waitFor(() => {
      expect(document.getElementById('panel-result')).toBeTruthy();
    });

    fireEvent.click(configTab);

    await waitFor(() => {
      expect(document.getElementById('panel-config')).toBeTruthy();
    });
  });
});
