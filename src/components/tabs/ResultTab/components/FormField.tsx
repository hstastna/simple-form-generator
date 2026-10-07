import {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { formFieldTypes, RadioOption } from '@/schemas/formFieldSchema';
import { UseFormRegister } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { getValidationRules } from '@/utils';
import { TextNumDateField } from './TextNumDateField';
import { TextAreaField } from './TextAreaField';
import { CheckboxField } from './CheckboxField';
import { RadioField } from './RadioField';
import { RequiredMark } from './RequiredMark';

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
    | { type: 'radio'; options?: RadioOption[] }
    | { type: Exclude<FormFieldType, 'radio'>; options?: never }
  );

type FormFieldProps = {
  field: FormField;
  register: UseFormRegister<ResultFormData>;
  error?: FieldError;
};

export const FormField: FC<FormFieldProps> = ({ field, register, error }) => {
  const { id, type, label, options, ...props } = field;

  const required = field.required || options?.some((option) => option.required);
  const validationRules = getValidationRules({ ...field, required });

  const errorId = error ? `${id}-error` : undefined;

  const errorAria = {
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby':
      [field['aria-describedby'], errorId].filter(Boolean).join(' ') ||
      undefined,
  } as const;

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
            {...props}
            {...errorAria}
          />
        );

      case 'textarea':
        return (
          <TextAreaField
            id={id}
            register={register}
            validationRules={validationRules}
            label={label}
            {...props}
            {...errorAria}
          />
        );

      case 'checkbox':
        return (
          <CheckboxField
            id={id}
            register={register}
            validationRules={validationRules}
            label={label}
            {...props}
            {...errorAria}
          />
        );

      case 'radio':
        if (options) {
          const {
            'aria-label': ariaLabel,
            'aria-labelledby': ariaLabelledBy,
            autoFocus,
            ...optionProps
          } = props;

          return (
            <fieldset
              role="radiogroup"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              {...errorAria}
            >
              {label && (
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {label}
                  {validationRules.required.value && <RequiredMark />}
                </legend>
              )}

              {options.map((option, index) => {
                const { id: ownId, ...optionAttributes } = option;
                const optionId = ownId || `${id}-${index}`;

                return (
                  <RadioField
                    key={optionId}
                    id={id}
                    inputId={optionId}
                    register={register}
                    validationRules={validationRules}
                    autoFocus={autoFocus && index === 0}
                    {...optionProps}
                    {...optionAttributes}
                    aria-invalid={errorAria['aria-invalid']}
                    aria-describedby={
                      [
                        option['aria-describedby'] ?? field['aria-describedby'],
                        errorId,
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  />
                );
              })}
            </fieldset>
          );
        }

        return (
          <RadioField
            id={id}
            register={register}
            validationRules={validationRules}
            label={label}
            {...props}
            {...errorAria}
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
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${['checkbox', 'radio'].includes(type) ? '' : 'ml-[calc(20%)]'}`}
          role="alert"
        >
          {typeof error.message === 'string' ? error.message : 'Invalid input'}
        </p>
      )}
    </div>
  );
};
