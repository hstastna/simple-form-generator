import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { FC } from 'react';
import { FormProvider, useFormContext } from '@/context/FormContext';
import { tailwindFormTheme } from '@/formThemes';
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

  it('starts on the unstyled code', () => {
    renderCodeTab();

    expect(
      screen
        .getByRole('tab', { name: 'Unstyled' })
        .getAttribute('aria-selected')
    ).toBe('true');
    expect(
      screen.getByRole('textbox', { name: 'Generated React code' }).textContent
    ).not.toContain('className=');
  });

  it('shows the Tailwind CSS code and its hint after a click on its tab', () => {
    renderCodeTab();

    fireEvent.click(screen.getByRole('tab', { name: 'Tailwind CSS' }));

    expect(
      screen
        .getByRole('tab', { name: 'Tailwind CSS' })
        .getAttribute('aria-selected')
    ).toBe('true');
    expect(
      screen.getByRole('textbox', { name: 'Generated React code' }).textContent
    ).toContain(`className="${tailwindFormTheme.form}"`);
    expect(document.getElementById('form-code-hint')?.textContent).toContain(
      'and Tailwind CSS v4.1 or later.'
    );
  });

  it('moves the focus between the code tabs with the arrow keys', () => {
    renderCodeTab();
    const unstyled = screen.getByRole('tab', { name: 'Unstyled' });
    const tailwind = screen.getByRole('tab', { name: 'Tailwind CSS' });

    fireEvent.keyDown(unstyled, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tailwind);

    fireEvent.keyDown(tailwind, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(unstyled);
  });

  it('copies the code of the selected tab', async () => {
    const writeText = jest.fn<(text: string) => Promise<void>>(() =>
      Promise.resolve()
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderCodeTab();

    fireEvent.click(screen.getByRole('tab', { name: 'Tailwind CSS' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });

    expect(writeText.mock.calls[0][0]).toContain(
      `className="${tailwindFormTheme.form}"`
    );
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
