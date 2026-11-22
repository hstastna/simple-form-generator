import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach } from '@jest/globals';
import { CONFIG_STORAGE_KEY } from '@/constants';
import { FormProvider } from '@/context/FormContext';
import { ConfigTab } from './ConfigTab';

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

  it('reports a field with no accessible name', async () => {
    const editor = renderConfigTab();

    fireEvent.input(editor, {
      target: {
        textContent:
          '{ "title": "T", "items": [{ "type": "checkbox" }], "buttons": [{ "text": "Send" }] }',
      },
    });

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'items.0.label: Add a label, aria-label or aria-labelledby'
      )
    );
  });
});

describe('ConfigTab saved configuration', () => {
  const invalidConfig = '{ "items": [';

  afterEach(() => localStorage.clear());

  const typeConfig = async (editor: HTMLElement, text: string) => {
    fireEvent.input(editor, { target: { textContent: text } });
    await waitFor(() => expect(editor.textContent).toBe(text));
  };

  const querySaveButton = () =>
    screen.queryByRole('button', { name: 'Save to browser' });
  const queryRemoveButton = () =>
    screen.queryByRole('button', { name: 'Remove from browser' });

  it('offers saving once the example changes and saves on click', async () => {
    const editor = renderConfigTab();
    expect(querySaveButton()).toBeNull();
    expect(queryRemoveButton()).toBeNull();

    await typeConfig(editor, invalidConfig);
    fireEvent.click(querySaveButton()!);

    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBe(invalidConfig);
    expect(querySaveButton()).toBeNull();
    expect(document.activeElement).toBe(queryRemoveButton());
  });

  it('restores the saved configuration and offers saving once it changes', async () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, invalidConfig);
    const editor = renderConfigTab();
    expect(editor.textContent).toBe(invalidConfig);
    expect(querySaveButton()).toBeNull();

    await typeConfig(editor, '{ "items": [] }');

    expect(querySaveButton()).toBeTruthy();
    expect(queryRemoveButton()).toBeTruthy();
  });

  it('removes the saved configuration and keeps the editor text', () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, invalidConfig);
    const editor = renderConfigTab();

    fireEvent.click(queryRemoveButton()!);

    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
    expect(editor.textContent).toBe(invalidConfig);
    expect(queryRemoveButton()).toBeNull();
    expect(document.activeElement).toBe(querySaveButton());
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
