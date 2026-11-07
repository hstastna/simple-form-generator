import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { tailwindFormTheme } from '@/formThemes';
import { getValidationRules } from '@/utils';
import { ResultFormData } from '../ResultTab';
import { FormFieldType } from './FormField';
import { TextNumDateField } from './TextNumDateField';

type HarnessProps = {
  type?: Extract<FormFieldType, 'text' | 'number' | 'date'>;
  label?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  'aria-label'?: string;
};

const Harness: FC<HarnessProps> = ({ type = 'text', required, ...props }) => {
  const { control, register } = useForm<ResultFormData>();

  return (
    <TextNumDateField
      id="nick"
      type={type}
      control={control}
      register={register}
      validationRules={getValidationRules({ type, required })}
      required={required}
      {...props}
    />
  );
};

describe('TextNumDateField', () => {
  it('names the input with the label from the JSON config', () => {
    render(<Harness label="Nick" />);

    expect(screen.getByLabelText('Nick')).toBe(screen.getByRole('textbox'));
  });

  it('renders a number field from the type in the JSON config', () => {
    render(<Harness label="Nick" type="number" />);

    expect(screen.getByLabelText<HTMLInputElement>('Nick').type).toBe('number');
  });

  it('renders a date field from the type in the JSON config', () => {
    render(<Harness label="Nick" type="date" />);

    expect(screen.getByLabelText<HTMLInputElement>('Nick').type).toBe('date');
  });

  it('greys out the date format of an empty date input like a placeholder', () => {
    render(<Harness label="Nick" type="date" />);

    const nick = screen.getByLabelText('Nick');
    expect(nick.className).toBe(tailwindFormTheme.emptyDateInput);

    fireEvent.change(nick, { target: { value: '2026-11-06' } });
    expect(nick.className).toBe(tailwindFormTheme.dateInput);

    fireEvent.change(nick, { target: { value: '' } });
    expect(nick.className).toBe(tailwindFormTheme.emptyDateInput);
  });

  it('keeps the text colour of a date preset in the JSON config', () => {
    render(<Harness label="Nick" type="date" defaultValue="2026-11-06" />);

    expect(screen.getByLabelText('Nick').className).toBe(
      tailwindFormTheme.dateInput
    );
  });

  it('keeps the text colour of a date pinned in the JSON config', () => {
    render(<Harness label="Nick" type="date" value="2026-11-06" />);

    const nick = screen.getByLabelText('Nick');
    fireEvent.change(nick, { target: { value: '' } });

    expect(nick.className).toBe(tailwindFormTheme.dateInput);
  });

  it('predefines the input with the value from the JSON config', () => {
    render(<Harness label="Nick" value="preset" />);

    expect(screen.getByLabelText<HTMLInputElement>('Nick').value).toBe(
      'preset'
    );
  });

  it('pins the input given value in the JSON config', () => {
    render(<Harness label="Nick" value="preset" />);

    const nick = screen.getByLabelText<HTMLInputElement>('Nick');
    fireEvent.change(nick, { target: { value: 'typed by user' } });

    expect(nick.value).toBe('preset');
  });

  it('lets the user retype a defaultValue from the JSON config', () => {
    render(<Harness label="Nick" defaultValue="preset" />);

    const nick = screen.getByLabelText<HTMLInputElement>('Nick');
    fireEvent.change(nick, { target: { value: 'typed by user' } });

    expect(nick.value).toBe('typed by user');
  });

  it('lets an aria-label in the JSON config outrank the label', () => {
    render(<Harness label="Nick" aria-label="Nickname" />);

    expect(screen.getByRole('textbox', { name: 'Nickname' })).toBe(
      screen.getByLabelText('Nick')
    );
  });

  it('wraps a single input in no group role', () => {
    render(<Harness label="Nick" />);

    expect(screen.queryByRole('group')).toBeNull();
  });

  it('marks a required input with the required attribute', () => {
    render(<Harness label="Nick" required />);

    expect(screen.getByRole<HTMLInputElement>('textbox').required).toBe(true);
    expect(document.querySelector('label')?.textContent).toContain(
      '(required)'
    );
  });

  it('omits required when the input is optional', () => {
    render(<Harness label="Nick" />);

    expect(screen.getByRole<HTMLInputElement>('textbox').required).toBe(false);
  });
});
