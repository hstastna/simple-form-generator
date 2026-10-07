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

const presetConfig = JSON.stringify({
  title: 'Preset form',
  items: [
    {
      id: 'plan',
      type: 'radio',
      label: 'Plan',
      options: [
        { value: 'basic', label: 'basic' },
        { value: 'pro', label: 'pro' },
      ],
    },
  ],
  buttons: [{ text: 'Send', type: 'submit' }],
});

const patternConfig = JSON.stringify({
  title: 'Pattern form',
  items: [{ id: 'code', type: 'text', label: 'Code', pattern: '[a-z]+' }],
  buttons: [{ text: 'Send', type: 'submit' }],
});

const semanticsConfig = JSON.stringify({
  title: 'Semantics form',
  items: [
    {
      id: 'plan',
      type: 'radio',
      label: 'Plan',
      options: [
        { value: 'basic', label: 'basic' },
        { value: 'pro', label: 'pro' },
      ],
      required: true,
    },
  ],
  buttons: [{ text: 'Send', type: 'submit' }],
});

const optionsConfig = JSON.stringify({
  title: 'Options form',
  items: [
    {
      id: 'plan',
      type: 'radio',
      label: 'Plan',
      options: [
        { value: 'basic', label: 'Basic', disabled: true },
        { value: 'pro', label: 'Pro', defaultChecked: true, required: true },
      ],
    },
  ],
  buttons: [{ text: 'Send', type: 'submit' }],
});

const noIdConfig = JSON.stringify({
  title: 'No id form',
  items: [{ type: 'text', label: 'Name' }],
  buttons: [{ text: 'Send', type: 'submit' }],
});

const ariaLabelConfig = JSON.stringify({
  title: 'Aria label form',
  items: [
    {
      id: 'plan',
      type: 'radio',
      'aria-label': 'Plan',
      options: [{ value: 'basic', label: 'basic' }],
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

describe('ResultTab radio options', () => {
  it("applies each option's own attributes and requires the group", async () => {
    render(
      <FormProvider>
        <ConfigLoader json={optionsConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const basic = await screen.findByLabelText<HTMLInputElement>('Basic');
    const pro = screen.getByLabelText<HTMLInputElement>('Pro');
    expect(basic.disabled).toBe(true);
    expect(basic.checked).toBe(false);
    expect(pro.checked).toBe(true);
    expect(pro.required).toBe(true);
    expect(document.querySelector('legend')?.textContent).toContain(
      '(required)'
    );
  });
});

describe('ResultTab fallback id', () => {
  it('gives a field without an id the fallback field-<index>', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={noIdConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    expect((await screen.findByLabelText('Name')).id).toBe('field-0');
  });
});

describe('ResultTab preset values', () => {
  it('submits the radio option the user picked', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={presetConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    await screen.findByLabelText('basic');

    fireEvent.click(screen.getByLabelText('pro'));
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() =>
      expect(
        screen.getByRole('region', { name: /JSON/ }).textContent
      ).toContain('"plan": "pro"')
    );
  });
});

describe('ResultTab native validation', () => {
  it('reports a pattern mismatch with the form error, not the browser', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={patternConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const code = await screen.findByLabelText<HTMLInputElement>('Code');
    fireEvent.change(code, { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByText('Send'));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Please match the requested format'
    );
  });
});

describe('ResultTab parse error', () => {
  it('keeps the tab panel the result tab points at', async () => {
    render(
      <FormProvider>
        <ConfigLoader json="{ broken" />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Cannot render form');
    expect(screen.getByRole('tabpanel').id).toBe('panel-result');
  });
});

describe('ResultTab field semantics', () => {
  it('links every radio option to the group error message', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={semanticsConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));
    await screen.findByLabelText('basic');

    fireEvent.click(screen.getByText('Send'));
    await screen.findByRole('alert');

    expect(
      screen.getByLabelText('basic').getAttribute('aria-describedby')
    ).toBe('plan-error');
    expect(screen.getByLabelText('pro').getAttribute('aria-describedby')).toBe(
      'plan-error'
    );
  });

  it('names a radio group from aria-label and renders no legend', async () => {
    render(
      <FormProvider>
        <ConfigLoader json={ariaLabelConfig} />
        <ResultTab />
      </FormProvider>
    );

    fireEvent.click(screen.getByText('load config'));

    expect(
      await screen.findByRole('radiogroup', { name: 'Plan' })
    ).not.toBeNull();
    expect(document.querySelector('legend')).toBeNull();
    expect(
      screen.getByLabelText('basic').getAttribute('aria-label')
    ).toBeNull();
  });
});
