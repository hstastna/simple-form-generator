import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { FormFieldType } from './FormField';
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
  value,
  ...props
}) => {
  const isRequired = validationRules.required.value;

  return (
    <div className="grid grid-cols-[20%_80%] items-center w-full">
      <div className="wrap-break-word">
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className="w-full">
        <input
          id={id}
          type={type}
          className="p-3 block w-full border border-gray-500 rounded dark:border-gray-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          {...props}
          defaultValue={value}
          aria-required={isRequired ? 'true' : undefined}
          {...register(id, validationRules)}
        />
      </div>
    </div>
  );
};
