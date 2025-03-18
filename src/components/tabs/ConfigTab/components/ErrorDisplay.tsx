import React, { FC } from 'react';

type ValidationError = {
  code: string;
  path: string[];
  message: string;
  keys?: string[];
  expected?: string;
  received?: string;
};

type ErrorDisplayProps = {
  error: string | null;
};

export const ErrorDisplay: FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  const isJsonArray = error.trim().startsWith('[');
  const parsedError = isJsonArray // only parse if it looks like JSON array
    ? (JSON.parse(error) as ValidationError[])
    : error;

  const errorContent = Array.isArray(parsedError) ? (
    <>
      <h3 className="text-lg font-semibold" id="validation-error-heading">
        Found {parsedError.length} validation{' '}
        {parsedError.length === 1 ? 'error' : 'errors'}:
      </h3>

      <ul
        className="mt-2 space-y-2 list-disc pl-5"
        aria-labelledby="validation-error-heading"
      >
        {parsedError.map((err, index) => (
          <li key={`${err.code}-${err.path.join('.')}-${index}`} tabIndex={0}>
            <span className="font-medium">{err.path.join('.')}: </span>
            <span>{err.message}</span>

            {err.expected && err.received && (
              <div className="text-sm mt-1" aria-live="polite">
                Expected:{' '}
                <code
                  className="bg-red-200 px-1 rounded"
                  aria-label={`Expected value: ${err.expected}`}
                >
                  {err.expected}
                </code>
                , Received:{' '}
                <code
                  className="bg-red-200 px-1 rounded"
                  aria-label={`Received value: ${err.received}`}
                >
                  {err.received}
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
