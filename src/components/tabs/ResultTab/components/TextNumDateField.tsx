import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { FormFieldType } from './FormField';
import { defaultFormTheme } from '@/formThemes';
import { ValidationRules } from '@/utils';

type TextNumDateFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  type: Extract<FormFieldType, 'text' | 'number' | 'date'>;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
};

export const TextNumDateField: FC<TextNumDateFieldProps> = ({
  id,
  type,
  register,
  validationRules,
  label,
  ...props
}) => {
  const isRequired = validationRules.required.value;

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
              ? defaultFormTheme.dateInput
              : defaultFormTheme.textNumDateInput
          }
          {...props}
          {...register(id, validationRules)}
        />
      </div>
    </div>
  );
};
