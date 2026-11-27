import { FC, SelectHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { tailwindFormTheme } from '@/formThemes';
import { SelectOption } from '@/schemas/formFieldSchema';
import { ValidationRules } from '@/utils';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
  options?: SelectOption[];
};

export const SelectField: FC<SelectFieldProps> = ({
  id,
  register,
  validationRules,
  label,
  options,
  ...props
}) => (
  <div className={tailwindFormTheme.textNumDateRow}>
    <div className={tailwindFormTheme.labelCell}>
      {label && (
        <FormLabel
          id={id}
          label={label}
          required={validationRules.required.value}
          marginRight
        />
      )}
    </div>

    <div className={tailwindFormTheme.controlCell}>
      <select
        id={id}
        className={tailwindFormTheme.select}
        {...props}
        {...register(id, validationRules)}
      >
        {options?.map(({ label: optionLabel, ...option }, index) => (
          <option key={option.id || `${id}-${index}`} {...option}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  </div>
);
