import React, { FC } from 'react';

type FormLabelProps = {
  id: string;
  label: string;
  required?: boolean;
  marginRight?: boolean;
};

export const FormLabel: FC<FormLabelProps> = ({
  id,
  label,
  required,
  marginRight,
}) => (
  <label
    id={`label-${id}`}
    htmlFor={id}
    className={`${marginRight ? 'mr-1.5' : 'ml-1.5'} block text-sm font-medium`}
  >
    {label}
    {required && (
      <>
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </>
    )}
  </label>
);
