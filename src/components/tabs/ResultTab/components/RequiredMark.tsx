import { FC } from 'react';

export const RequiredMark: FC = () => (
  <>
    <span className="text-red-500 ml-1" aria-hidden="true">
      *
    </span>
    <span className="sr-only"> (required)</span>
  </>
);
