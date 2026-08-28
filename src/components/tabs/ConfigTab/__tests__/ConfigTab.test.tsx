import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach } from '@jest/globals';
import { FormProvider } from '@/context/FormContext';
import { ConfigTab } from '../ConfigTab';

const renderConfigTab = () => {
  render(
    <FormProvider>
      <ConfigTab />
    </FormProvider>
  );

  return screen.getByRole('textbox', {
    name: 'JSON Form Configuration Editor',
  });
};

const setPrefersDarkMode = (matches: boolean) => {
  window.matchMedia = () =>
    ({
      matches,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
};

describe('ConfigTab editor keyboard exit', () => {
  it('blurs the editor on Escape', () => {
    const editor = renderConfigTab();
    editor.focus();
    expect(document.activeElement).toBe(editor);

    fireEvent.keyDown(editor, { key: 'Escape' });

    expect(document.activeElement).not.toBe(editor);
  });

  it('keeps focus in the editor on any other key', () => {
    const editor = renderConfigTab();
    editor.focus();

    fireEvent.keyDown(editor, { key: 'a' });

    expect(document.activeElement).toBe(editor);
  });
});

describe('ConfigTab invalid configuration', () => {
  it('marks the editor invalid and lists the issue once parsing fails', async () => {
    const editor = renderConfigTab();
    expect(editor.getAttribute('aria-invalid')).toBe('false');

    fireEvent.input(editor, {
      target: { textContent: '{ "title": 1, "items": [], "buttons": [] }' },
    });

    await waitFor(() =>
      expect(editor.getAttribute('aria-invalid')).toBe('true')
    );

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('Found 1 validation error:');
    expect(status.textContent).toContain(
      'title: Invalid input: expected string'
    );
  });
});

describe('ConfigTab colour scheme', () => {
  afterEach(() => setPrefersDarkMode(false));

  it('follows the dark mode media query', () => {
    setPrefersDarkMode(true);
    renderConfigTab();

    expect(document.querySelector('.cm-theme-dark')).toBeTruthy();
    expect(document.querySelector('.cm-theme-light')).toBeNull();
  });
});
