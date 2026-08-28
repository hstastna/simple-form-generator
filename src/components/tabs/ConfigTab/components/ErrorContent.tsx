import { FC } from 'react';

type ValidationIssue = {
  path: (string | number)[];
  message: string;
  errors?: ValidationIssue[][];
};

const parseIssues = (error: string): ValidationIssue[] | null => {
  try {
    const parsed = JSON.parse(error);
    return Array.isArray(parsed) ? (parsed as ValidationIssue[]) : null;
  } catch {
    return null;
  }
};

const issueLocation = ({ path }: ValidationIssue) =>
  path.length > 0 ? path.join('.') : 'Configuration root';

const issueMessage = ({ errors, message }: ValidationIssue) =>
  errors?.length
    ? errors
        .flat()
        .map((branch) => branch.message)
        .join(' or ')
    : message;

type ErrorContentProps = {
  error: string;
};

export const ErrorContent: FC<ErrorContentProps> = ({ error }) => {
  const issues = parseIssues(error);

  if (!issues) {
    return (
      <>
        <strong>Error:</strong> {error}
      </>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold">
        Found {issues.length} validation{' '}
        {issues.length === 1 ? 'error' : 'errors'}:
      </h3>

      <ul className="mt-2 space-y-2 list-disc pl-5">
        {issues.map((issue, index) => (
          <li key={index}>
            <span className="font-medium">{issueLocation(issue)}: </span>
            <span>{issueMessage(issue)}</span>
          </li>
        ))}
      </ul>
    </>
  );
};
