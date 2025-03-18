import React, {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { formFieldTypes } from '@/schemas/formFieldSchema';
import { UseFormRegister } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { getValidationRules } from '@/utils';
import { TextNumDateField } from './TextNumDateField';
import { TextAreaField } from './TextAreaField';
import { CheckboxField } from './CheckboxField';
import { RadioField } from './RadioField';

export type FormFieldType = (typeof formFieldTypes)[number];

type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type TextAreaProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

type InputAndTextAreaProps = InputProps & TextAreaProps;

export type FormField = InputAndTextAreaProps & {
  id: string;
  label?: string;
} & (
    | { type: 'radio'; options: string[]; labels?: string[] }
    | { type: Exclude<FormFieldType, 'radio'>; options?: never; labels?: never }
  );

type FormFieldProps = {
  field: FormField;
  register: UseFormRegister<ResultFormData>;
  error?: FieldError;
};

export const FormField: FC<FormFieldProps> = ({ field, register, error }) => {
  const {
    id,
    type,
    label,
    options,
    labels,
    minLength,
    maxLength,
    min,
    max,
    required,
    ...props
  } = field;

  const validationRules = getValidationRules({
    type,
    required,
    minLength,
    maxLength,
    min,
    max,
  });

  const errorId = error ? `${id}-error` : undefined;

  const renderField = () => {
    switch (type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <TextNumDateField
            id={id}
            type={type}
            register={register}
            validationRules={validationRules}
            label={label}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            {...props}
          />
        );

      case 'textarea':
        return (
          <TextAreaField
            id={id}
            register={register}
            validationRules={validationRules}
            label={label}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            {...props}
          />
        );

      case 'checkbox':
        return (
          <CheckboxField
            id={id}
            register={register}
            validationRules={validationRules}
            label={label}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            {...props}
          />
        );

      case 'radio':
        if (options) {
          return (
            <fieldset
              role="radiogroup"
              aria-required={required ? 'true' : 'false'}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={errorId}
            >
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                {label || 'Options to choose from'}
                {/* Provide fallback text for screen readers */}
                {required && (
                  <>
                    <span className="text-red-500 ml-1" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only"> (required)</span>
                  </>
                )}
              </legend>

              {options.map((option, index) => (
                <RadioField
                  key={option}
                  id={id}
                  register={register}
                  validationRules={validationRules}
                  label={labels?.[index] || option}
                  option={option}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={errorId}
                  {...props}
                />
              ))}
            </fieldset>
          );
        }

        return (
          <RadioField
            id={id}
            register={register}
            validationRules={validationRules}
            label={label}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            {...props}
          />
        );

      default:
        return <p>Unknown field type: {type}</p>;
    }
  };

  return (
    <div className="relative mb-4 w-full">
      {renderField()}

      {error && (
        <p
          id={errorId}
          className={`mt-1 text-sm text-red-600 ${['checkbox', 'radio'].includes(type) ? '' : 'ml-[calc(20%)]'}`}
          role="alert"
          aria-live="assertive"
        >
          {typeof error.message === 'string' ? error.message : 'Invalid input'}
        </p>
      )}
    </div>
  );
};
