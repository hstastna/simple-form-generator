import {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { formFieldTypes, RadioOption } from '@/schemas/formFieldSchema';
import { Control, UseFormRegister } from 'react-hook-form';
import { FieldError } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { tailwindFormTheme } from '@/formThemes';
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
  control: Control<ResultFormData>;
  register: UseFormRegister<ResultFormData>;
  error?: FieldError;
};

export const FormField: FC<FormFieldProps> = ({
  field,
  control,
  register,
  error,
}) => {
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
            control={control}
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
                <legend className={tailwindFormTheme.legend}>
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
    <div className={tailwindFormTheme.field}>
      {renderField()}

      {error && (
        <p
          id={errorId}
          className={
            ['checkbox', 'radio'].includes(type)
              ? tailwindFormTheme.error
              : tailwindFormTheme.gridError
          }
          role="alert"
        >
          {typeof error.message === 'string' ? error.message : 'Invalid input'}
        </p>
      )}
    </div>
  );
};
