import { FC, TextareaHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { UseFormRegister } from 'react-hook-form';
import { ResultFormData } from '../ResultTab';
import { ValidationRules } from '@/utils';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  register: UseFormRegister<ResultFormData>;
  validationRules: ValidationRules;
  label?: string;
};

export const TextAreaField: FC<TextAreaFieldProps> = ({
  id,
  register,
  validationRules,
  label,
  ...props
}) => {
  const isRequired = validationRules.required.value;

  return (
    <div
      className="grid grid-cols-[20%_80%] items-baseline w-full"
      role="group"
    >
      <div className="text-left break-words">
        {label && (
          <FormLabel id={id} label={label} required={isRequired} marginRight />
        )}
      </div>

      <div className="w-full">
        <textarea
          id={id}
          className="p-3 block w-full border border-gray-500 rounded dark:border-gray-400 placeholder:text-gray-600 dark:placeholder:text-gray-400"
          {...props}
          aria-required={isRequired ? 'true' : undefined}
          {...register(id, {
            ...validationRules,
          })}
        />
      </div>
    </div>
  );
};
