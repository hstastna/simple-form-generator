import { FC } from 'react';
import { tailwindFormTheme } from '@/formThemes';
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
    htmlFor={id}
    className={
      marginRight
        ? tailwindFormTheme.labelBeforeControl
        : tailwindFormTheme.labelAfterControl
    }
  >
    {label}
    {required && <RequiredMark />}
  </label>
);
