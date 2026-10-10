import { FC, useEffect, useState } from 'react';
import { LuCheck, LuCopy, LuX } from 'react-icons/lu';

type CopyStatus = 'idle' | 'copied' | 'failed';

type CopyButtonProps = {
  text: string;
};

const statusMessages: Record<CopyStatus, string> = {
  idle: '',
  copied: 'Copied',
  failed: 'Copy failed',
};

const statusIcons = {
  idle: LuCopy,
  copied: LuCheck,
  failed: LuX,
};

export const CopyButton: FC<CopyButtonProps> = ({ text }) => {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const StatusIcon = statusIcons[status];

  useEffect(() => {
    if (status === 'idle') {
      return;
    }

    const timeoutId = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timeoutId);
  }, [status]);

  const copyText = async () => {
    setStatus('idle');

    try {
      // navigator.clipboard is undefined on insecure (non-HTTPS) origins
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Copy"
        onClick={copyText}
        className="flex items-center gap-1.5 px-2 py-1 text-sm rounded border border-gray-500 bg-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-neutral-700 dark:focus-visible:outline-blue-400"
      >
        <StatusIcon aria-hidden="true" />
        {statusMessages[status] || 'Copy'}
      </button>
      <span role="status" className="sr-only">
        {statusMessages[status]}
      </span>
    </>
  );
};
