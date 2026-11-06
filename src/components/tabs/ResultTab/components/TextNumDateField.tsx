import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { Control, UseFormRegister, useWatch } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { FormFieldType } from './FormField';
import { defaultFormTheme } from '@/formThemes';
import { ValidationRules } from '@/utils';

type TextNumDateFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  type: Extract<FormFieldType, 'text' | 'number' | 'date'>;
  control: Control<ResultFormData>;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
};

export const TextNumDateField: FC<TextNumDateFieldProps> = ({
  id,
  type,
  control,
  register,
  validationRules,
  label,
  ...props
}) => {
  const isRequired = validationRules.required.value;
  const { value, defaultValue } = props;
  const pickedDate = useWatch({
    control,
    name: id,
    disabled: type !== 'date',
  });
  const isEmptyDate = !(value ?? pickedDate ?? defaultValue);
  const dateInputClassName = isEmptyDate
    ? defaultFormTheme.emptyDateInput
    : defaultFormTheme.dateInput;

  return (
    <div className={defaultFormTheme.textNumDateRow}>
      <div className={defaultFormTheme.labelCell}>
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className={defaultFormTheme.controlCell}>
        <input
          id={id}
          type={type}
          className={
            type === 'date'
              ? dateInputClassName
              : defaultFormTheme.textNumDateInput
          }
          {...props}
          {...register(id, validationRules)}
        />
      </div>
    </div>
  );
};
