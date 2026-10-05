import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { getValidationRules } from '@/utils';
import { ResultFormData } from '../ResultTab';
import { RadioField } from './RadioField';

const Group: FC<{ required?: boolean }> = ({ required }) => {
  const { register } = useForm<ResultFormData>();

  return ['basic', 'pro'].map((option, index) => (
    <RadioField
      key={option}
      id="plan"
      inputId={`plan-${index}`}
      value={option}
      label={option}
      required={required}
      register={register}
      validationRules={getValidationRules({ type: 'radio', required })}
    />
  ));
};

const Single: FC<{ required?: boolean; checked?: boolean }> = ({
  required,
  checked,
}) => {
  const { register } = useForm<ResultFormData>();

  return (
    <RadioField
      id="consent"
      label="Consent"
      value="agreed"
      checked={checked}
      required={required}
      register={register}
      validationRules={getValidationRules({ type: 'radio', required })}
    />
  );
};

describe('RadioField group', () => {
  it('gives every option its own id and value, and none is preselected', () => {
    render(<Group />);

    const basic = screen.getByLabelText<HTMLInputElement>('basic');
    const pro = screen.getByLabelText<HTMLInputElement>('pro');
    expect([basic.id, pro.id]).toEqual(['plan-0', 'plan-1']);
    expect([basic.value, pro.value]).toEqual(['basic', 'pro']);
    expect([basic.checked, pro.checked]).toEqual([false, false]);
  });

  it('marks every option required but leaves the required text to the group', () => {
    render(<Group required />);

    expect(screen.getByLabelText<HTMLInputElement>('basic').required).toBe(
      true
    );
    expect(document.querySelector('label')?.textContent).not.toContain(
      '(required)'
    );
  });
});

describe('RadioField on its own', () => {
  it('keeps the configured value and marks itself required', () => {
    render(<Single required />);

    const consent = screen.getByLabelText<HTMLInputElement>(/^Consent/);
    expect(consent.id).toBe('consent');
    expect(consent.value).toBe('agreed');
    expect(consent.required).toBe(true);
    expect(document.querySelector('label')?.textContent).toContain(
      '(required)'
    );
  });

  it('preselects itself given checked in the JSON config', () => {
    render(<Single checked />);

    expect(screen.getByLabelText<HTMLInputElement>(/^Consent/).checked).toBe(
      true
    );
  });
});
