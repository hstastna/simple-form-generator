import { FC } from 'react';

export const RequiredMark: FC = () => (
  <>
    <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden="true">
      *
    </span>
    <span className="sr-only"> (required)</span>
  </>
);
