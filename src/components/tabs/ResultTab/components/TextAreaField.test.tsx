import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { getValidationRules } from '@/utils';
import { ResultFormData } from '../ResultTab';
import { TextAreaField } from './TextAreaField';

type HarnessProps = {
  label?: string;
  required?: boolean;
  text?: string;
};

const Harness: FC<HarnessProps> = ({ required, ...props }) => {
  const { register } = useForm<ResultFormData>();

  return (
    <TextAreaField
      id="bio"
      register={register}
      validationRules={getValidationRules({ type: 'textarea', required })}
      {...props}
    />
  );
};

describe('TextAreaField', () => {
  it('names the textarea with the label from the JSON config', () => {
    render(<Harness label="Bio" />);

    expect(screen.getByLabelText('Bio')).toBe(screen.getByRole('textbox'));
  });

  it('predefines the text from the text key in the JSON config', () => {
    render(<Harness label="Bio" text="preset bio" />);

    expect(screen.getByLabelText<HTMLTextAreaElement>('Bio').value).toBe(
      'preset bio'
    );
  });

  it('lets the user retype the predefined text', () => {
    render(<Harness label="Bio" text="preset bio" />);

    const bio = screen.getByLabelText<HTMLTextAreaElement>('Bio');
    fireEvent.change(bio, { target: { value: 'edited by user' } });

    expect(bio.value).toBe('edited by user');
  });

  it('marks a required textarea with aria-required', () => {
    render(<Harness label="Bio" required />);

    expect(screen.getByRole('textbox').getAttribute('aria-required')).toBe(
      'true'
    );
  });
});
