import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { FormProvider, useFormContext } from '@/context/FormContext';
import { ResultTab } from './ResultTab';

const config = JSON.stringify({
  title: 'Handler form',
  items: [{ id: 'name', type: 'text', label: 'Name' }],
  buttons: [{ text: 'Clear', onClick: 'clear' }],
});

const attributeConfig = JSON.stringify({
  title: 'Attribute form',
  items: [
    { id: 'consent', type: 'radio', label: 'Consent', value: 'agreed' },
    {
      id: 'note',
      type: 'text',
      label: 'Note',
      required: true,
      'aria-describedby': 'note-hint',
    },
  ],
  buttons: [{ text: 'Send', type: 'submit' }],
});

const ConfigLoader: FC<{ json?: string }> = ({ json = config }) => {
  const { setJsonConfig } = useFormContext();

  return <button onClick={() => setJsonConfig(json)}>load config</button>;
};

describe('ResultTab handler names', () => {
  it('runs the built-in action named in the JSON config', async () => {
    render(
      <FormProvider>
        <ConfigLoader />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const input = await screen.findByLabelText<HTMLInputElement>('Name');
    fireEvent.change(input, { target: { value: 'Hilda' } });
    expect(input.value).toBe('Hilda');

    fireEvent.click(screen.getByText('Clear'));

    await waitFor(() => expect(input.value).toBe(''));
  });
});

describe('ResultTab config attributes', () => {
  it('keeps the value and aria-describedby given in the JSON config', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={attributeConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const radio = await screen.findByLabelText<HTMLInputElement>('Consent');
    expect(radio.value).toBe('agreed');

    const note = screen.getByLabelText<HTMLInputElement>(/^Note/);
    expect(note.getAttribute('aria-describedby')).toBe('note-hint');
  });

  it('adds the error id alongside the config aria-describedby', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={attributeConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const note = await screen.findByLabelText<HTMLInputElement>(/^Note/);
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() =>
      expect(note.getAttribute('aria-describedby')).toBe('note-hint note-error')
    );
  });
});
