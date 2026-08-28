import { FC } from 'react';
import { ErrorContent } from './ErrorContent';

export const validationErrorsId = 'config-validation-errors';

type ErrorDisplayProps = {
  error: string | null;
};

// role="status" only announces changes while the region is already in the DOM
export const ErrorDisplay: FC<ErrorDisplayProps> = ({ error }) => (
  <div
    id={validationErrorsId}
    role="status"
    className={
      error
        ? 'mt-4 p-3 bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-md'
        : 'sr-only'
    }
  >
    {error ? <ErrorContent error={error} /> : 'Configuration is valid'}
  </div>
);
