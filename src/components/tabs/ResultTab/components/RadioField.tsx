import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { ValidationRules } from '@/utils';

type RadioFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  inputId?: string;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
};

export const RadioField: FC<RadioFieldProps> = ({
  id,
  inputId,
  register,
  validationRules,
  label,
  ...props
}) => {
  const isSingleRadio = inputId === undefined;
  const htmlId = inputId ?? id;
  const isRequired = isSingleRadio && validationRules.required.value;

  return (
    <div className={`${isSingleRadio ? '' : 'mb-1'} flex items-center`}>
      <input
        id={htmlId}
        type="radio"
        className="h-4 w-4 border border-gray-400 focus:ring-blue-500"
        {...props}
        {...register(id, validationRules)}
      />
      {label && <FormLabel id={htmlId} label={label} required={isRequired} />}
    </div>
  );
};
