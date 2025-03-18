import React, { FC } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { FormFieldType } from './FormField';
import { ValidationRules } from '@/utils';

type TextNumDateFieldProps = {
  id: string;
  type: FormFieldType;
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
    <div className="grid grid-cols-[20%_80%] items-center w-full" role="group">
      <div className="text-left break-words">
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className="w-full">
        <input
          id={id}
          type={type}
          className="p-3 block w-full border border-gray-400 rounded focus:ring-blue-500"
          aria-labelledby={label ? `label-${id}` : undefined}
          aria-required={isRequired ? 'true' : undefined}
          {...props}
          {...register(id, {
            ...validationRules,
          })}
        />
      </div>
    </div>
  );
};
