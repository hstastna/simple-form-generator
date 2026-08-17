import { FC } from 'react';

type ValidationError = {
  code: string;
  path: (string | number)[];
  message: string;
  keys?: string[];
  expected?: string;
};

const parseIssues = (error: string): ValidationError[] | null => {
  try {
    const parsed = JSON.parse(error);
    return Array.isArray(parsed) ? (parsed as ValidationError[]) : null;
  } catch {
    return null;
  }
};

type ErrorDisplayProps = {
  error: string | null;
};

export const ErrorDisplay: FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  const issues = parseIssues(error);

  const errorContent = issues ? (
    <>
      <h3 className="text-lg font-semibold" id="validation-error-heading">
        Found {issues.length} validation{' '}
        {issues.length === 1 ? 'error' : 'errors'}:
      </h3>

      <ul
        className="mt-2 space-y-2 list-disc pl-5"
        aria-labelledby="validation-error-heading"
      >
        {issues.map((err, index) => (
          <li key={`${err.code}-${err.path.join('.')}-${index}`} tabIndex={0}>
            <span className="font-medium">{err.path.join('.')}: </span>
            <span>{err.message}</span>

            {err.expected && (
              <div className="text-sm mt-1" aria-live="polite">
                Expected:{' '}
                <code
                  className="bg-red-200 px-1 rounded"
                  aria-label={`Expected value: ${err.expected}`}
                >
                  {err.expected}
                </code>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  ) : (
    <>
      <strong>Error:</strong> {error}
    </>
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mt-4 p-3 bg-red-200 text-red-700 rounded-md"
    >
      {errorContent}
    </div>
  );
};
