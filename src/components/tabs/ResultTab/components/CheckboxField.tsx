import React, { FC } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { ValidationRules } from '@/utils';

type CheckboxFieldProps = {
  id: string;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
};

export const CheckboxField: FC<CheckboxFieldProps> = ({
  id,
  register,
  validationRules,
  label,
  ...props
}) => {
  const isRequired = validationRules.required.value;

  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 border border-gray-400 focus:ring-blue-500"
        aria-labelledby={label ? `label-${id}` : undefined}
        aria-required={isRequired ? 'true' : undefined}
        {...props}
        {...register(id, { ...validationRules })}
      />
      {label && <FormLabel id={id} label={label} required={isRequired} />}
    </div>
  );
};
