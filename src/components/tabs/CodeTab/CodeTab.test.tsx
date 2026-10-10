import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from '@jest/globals';
import { FC } from 'react';
import { FormProvider, useFormContext } from '@/context/FormContext';
import { CodeTab } from './CodeTab';

const ConfigLoader: FC<{ json: string }> = ({ json }) => {
  const { setJsonConfig } = useFormContext();

  return <button onClick={() => setJsonConfig(json)}>load config</button>;
};

const renderCodeTab = () =>
  render(
    <FormProvider>
      <ConfigLoader json="{ invalid" />
      <CodeTab />
    </FormProvider>
  );

const setPrefersDarkMode = (matches: boolean) => {
  window.matchMedia = () =>
    ({
      matches,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
};

describe('CodeTab', () => {
  afterEach(() => setPrefersDarkMode(false));

  it('shows the generated component in a read-only editor', () => {
    renderCodeTab();

    const editor = screen.getByRole('textbox', {
      name: 'Generated React code',
    });

    expect(editor.textContent).toContain('export const GeneratedForm');
    expect(editor.getAttribute('aria-readonly')).toBe('true');
    expect(screen.getByText('GeneratedForm.tsx')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
  });

  it('blurs the editor on Escape', () => {
    renderCodeTab();
    const editor = screen.getByRole('textbox', {
      name: 'Generated React code',
    });
    editor.focus();

    fireEvent.keyDown(editor, { key: 'Escape' });

    expect(document.activeElement).not.toBe(editor);
  });

  it('follows the dark mode media query', () => {
    setPrefersDarkMode(true);
    renderCodeTab();

    expect(document.querySelector('.cm-theme-dark')).toBeTruthy();
  });

  it('shows an alert instead of code when the config does not parse', () => {
    renderCodeTab();

    fireEvent.click(screen.getByText('load config'));

    expect(screen.getByRole('alert').textContent).toContain(
      'Cannot generate code'
    );
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
