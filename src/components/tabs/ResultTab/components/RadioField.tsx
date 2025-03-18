import React, { FC } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { ValidationRules } from '@/utils';

type RadioFieldProps = {
  id: string;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
  option?: string;
};

export const RadioField: FC<RadioFieldProps> = ({
  id,
  register,
  validationRules,
  label,
  option,
  ...props
}) => {
  const inputId = `${id}${option ? `-${option}` : ''}`;

  return (
    <div className={`${option ? 'mb-1' : ''} flex items-center`}>
      <input
        id={inputId}
        type="radio"
        value={option}
        className="h-4 w-4 border border-gray-400 focus:ring-blue-500"
        aria-labelledby={label ? `label-${inputId}` : undefined}
        {...props}
        {...register(id, { ...validationRules })}
      />
      {label && (
        <FormLabel
          id={inputId}
          label={label}
          required={!option && validationRules?.required.value}
        />
      )}
    </div>
  );
};
