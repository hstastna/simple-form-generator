import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { ValidationRules } from '@/utils';

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
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
  checked,
  ...props
}) => {
  const isRequired = validationRules.required.value;

  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4"
        {...props}
        defaultChecked={checked}
        aria-required={isRequired ? 'true' : undefined}
        {...register(id, validationRules)}
      />
      {label && <FormLabel id={id} label={label} required={isRequired} />}
    </div>
  );
};
