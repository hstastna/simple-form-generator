import { FC, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { Control, UseFormRegister, useWatch } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { FormFieldType } from './FormField';
import { tailwindFormTheme } from '@/formThemes';
import { dateTimeSchemas, isDateTimeType, ValidationRules } from '@/utils';

type TextNumDateFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  type: Exclude<FormFieldType, 'textarea' | 'checkbox' | 'radio'>;
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
  const isDateTime = isDateTimeType(type);
  const pickedDate = useWatch({
    control,
    name: id,
    disabled: !isDateTime,
  });
  const isEmptyDate =
    isDateTime &&
    !dateTimeSchemas[type].safeParse(value ?? pickedDate ?? defaultValue)
      .success;
  const inputClassName =
    type === 'color'
      ? tailwindFormTheme.colorInput
      : type === 'range'
        ? tailwindFormTheme.rangeInput
        : isEmptyDate
          ? tailwindFormTheme.emptyDateInput
          : isDateTime
            ? tailwindFormTheme.dateInput
            : tailwindFormTheme.textNumDateInput;

  return (
    <div className={tailwindFormTheme.textNumDateRow}>
      <div className={tailwindFormTheme.labelCell}>
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className={tailwindFormTheme.controlCell}>
        <input
          id={id}
          type={type}
          className={inputClassName}
          {...props}
          {...register(id, validationRules)}
        />
      </div>
    </div>
  );
};
