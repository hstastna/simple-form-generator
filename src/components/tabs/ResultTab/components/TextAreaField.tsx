import { FC, TextareaHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { defaultFormTheme } from '@/formThemes';
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
    <div className={defaultFormTheme.textAreaRow}>
      <div className={defaultFormTheme.labelCell}>
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className={defaultFormTheme.controlCell}>
        <textarea
          id={id}
          className={defaultFormTheme.textArea}
          {...props}
          defaultValue={text}
          {...register(id, validationRules)}
        />
      </div>
    </div>
  );
};
