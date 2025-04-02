import React, { FC, MouseEvent } from 'react';
import { ButtonHTMLAttributes } from 'react';

type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isSubmitting: boolean;
  resetForm: (e: MouseEvent<HTMLButtonElement>) => void;
  text?: string;
};

export const FormButton: FC<FormButtonProps> = ({
  isSubmitting,
  resetForm,
  text,
  type = 'button',
  ...props
}) => {
  const isSubmitButton = type === 'submit';

  return (
    <button
      type={type}
      className="px-4 py-2 block bg-blue-600 text-white rounded hover:bg-gradient-to-r from-green-400 to-lime-500 hover:text-black"
      disabled={isSubmitButton && isSubmitting}
      aria-busy={isSubmitButton && isSubmitting ? 'true' : 'false'}
      onClick={type === 'reset' ? resetForm : undefined}
      {...props}
    >
      {isSubmitButton && isSubmitting ? (
        <span className="flex items-center">
          <span className="mr-2 animate-spin inline-block" aria-hidden="true">
            ↻
          </span>
          <span>Processing...</span>
          <span className="sr-only">
            Please wait while the form is being submitted
          </span>
        </span>
      ) : (
        text
      )}
    </button>
  );
};
