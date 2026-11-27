import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { getValidationRules } from '@/utils';
import { ResultFormData } from '../ResultTab';
import { SelectField } from './SelectField';

type HarnessProps = {
  required?: boolean;
  defaultValue?: string;
};

const Harness: FC<HarnessProps> = ({ required, ...props }) => {
  const { register } = useForm<ResultFormData>();

  return (
    <SelectField
      id="plan"
      register={register}
      validationRules={getValidationRules({ type: 'select', required })}
      label="Plan"
      options={[
        { value: 'basic', label: 'Basic' },
        { value: 'pro', label: 'Pro' },
      ]}
      required={required}
      {...props}
    />
  );
};

describe('SelectField', () => {
  it('names the select with the label from the JSON config', () => {
    render(<Harness />);

    expect(screen.getByLabelText('Plan')).toBe(screen.getByRole('combobox'));
  });

  it('renders each option with its label as text and its value', () => {
    render(<Harness />);

    expect(
      screen
        .getAllByRole<HTMLOptionElement>('option')
        .map(({ text, value }) => [text, value])
    ).toEqual([
      ['Basic', 'basic'],
      ['Pro', 'pro'],
    ]);
  });

  it('preselects the option from the defaultValue key in the JSON config', () => {
    render(<Harness defaultValue="pro" />);

    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('pro');
  });

  it('marks a required select with the required mark and attribute', () => {
    render(<Harness required />);

    expect(
      screen.getByRole<HTMLSelectElement>('combobox', {
        name: 'Plan (required)',
      }).required
    ).toBe(true);
  });
});
