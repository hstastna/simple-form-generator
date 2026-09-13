import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { getValidationRules } from '@/utils';
import { ResultFormData } from '../ResultTab';
import { CheckboxField } from './CheckboxField';

type HarnessProps = {
  label?: string;
  required?: boolean;
  checked?: boolean;
  'aria-label'?: string;
};

const Harness: FC<HarnessProps> = ({ required, ...props }) => {
  const { register } = useForm<ResultFormData>();

  return (
    <CheckboxField
      id="agree"
      register={register}
      validationRules={getValidationRules({ type: 'checkbox', required })}
      {...props}
    />
  );
};

describe('CheckboxField', () => {
  it('names the checkbox with the label from the JSON config', () => {
    render(<Harness label="Accept terms" />);

    expect(screen.getByLabelText('Accept terms')).toBe(
      screen.getByRole('checkbox')
    );
  });

  it('marks a required checkbox with aria-required', () => {
    render(<Harness label="Accept terms" required />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-required')).toBe('true');
    expect(document.querySelector('label')?.textContent).toContain(
      '(required)'
    );
  });

  it('omits aria-required when the checkbox is optional', () => {
    render(<Harness label="Accept terms" />);

    expect(
      screen.getByRole('checkbox').getAttribute('aria-required')
    ).toBeNull();
  });

  it('ticks the checkbox given checked in the JSON config, and pins it there', () => {
    render(<Harness label="Accept terms" checked />);

    const checkbox = screen.getByRole<HTMLInputElement>('checkbox');
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);

    expect(checkbox.checked).toBe(true);
  });

  it('keeps the config aria-label on the input and renders no label element', () => {
    render(<Harness aria-label="Accept terms" />);

    expect(screen.getByRole('checkbox').getAttribute('aria-label')).toBe(
      'Accept terms'
    );
    expect(document.querySelectorAll('label')).toHaveLength(0);
  });
});
