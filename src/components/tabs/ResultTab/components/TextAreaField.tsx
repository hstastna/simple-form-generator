import { FC, TextareaHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { tailwindFormTheme } from '@/formThemes';
import { ValidationRules } from '@/utils';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
  text?: string;
};

export const TextAreaField: FC<TextAreaFieldProps> = ({
  id,
  register,
  validationRules,
  label,
  text,
  ...props
}) => {
  const isRequired = validationRules.required.value;

  return (
    <div className={tailwindFormTheme.textAreaRow}>
      <div className={tailwindFormTheme.labelCell}>
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className={tailwindFormTheme.controlCell}>
        <textarea
          id={id}
          className={tailwindFormTheme.textArea}
          {...props}
          defaultValue={text}
          {...register(id, validationRules)}
        />
      </div>
    </div>
  );
};
