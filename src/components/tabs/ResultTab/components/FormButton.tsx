import { ButtonHTMLAttributes, FC, MouseEvent } from 'react';

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
      className={
        isSubmitButton
          ? 'px-4 py-2 block bg-blue-600 text-white rounded hover:bg-gradient-to-r from-green-400 to-lime-500 hover:text-black'
          : 'px-4 py-2 block rounded border border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-700'
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
