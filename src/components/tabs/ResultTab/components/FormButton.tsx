import { ButtonHTMLAttributes, FC } from 'react';
import { FormAction } from '@/formActions';
import { defaultFormTheme } from '@/formThemes';

type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isSubmitting: boolean;
  resetForm: FormAction;
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
      className={
        isSubmitButton ? defaultFormTheme.submitButton : defaultFormTheme.button
      }
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
        </span>
      ) : (
        text
      )}
    </button>
  );
};
