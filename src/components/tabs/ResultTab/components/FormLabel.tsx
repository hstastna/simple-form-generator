import React, { FC } from 'react';
import { RequiredMark } from './RequiredMark';

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
    {required && <RequiredMark />}
  </label>
);
