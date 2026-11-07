import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { tailwindFormTheme } from '@/formThemes';
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
  ...props
}) => {
  const isRequired = validationRules.required.value;

  return (
    <div className={tailwindFormTheme.checkboxRow}>
      <input
        id={id}
        type="checkbox"
        className={tailwindFormTheme.checkbox}
        {...props}
        {...register(id, validationRules)}
      />
      {label && <FormLabel id={id} label={label} required={isRequired} />}
    </div>
  );
};
