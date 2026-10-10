'use client';

import { FC } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useFormContext } from '@/context/FormContext';
import { generateFormCode } from '@/generateFormCode';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { CopyButton } from './components/CopyButton';

const codeHintId = 'form-code-hint';

export const CodeTab: FC = () => {
  const { formConfig, parseError } = useFormContext();
  const isDarkMode = useIsDarkMode();

  if (parseError || !formConfig) {
    return (
      <div id="panel-code" role="tabpanel" aria-labelledby="tab-code">
        <div className="p-6 bg-red-200 dark:bg-red-900 rounded-md" role="alert">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-100 mb-2">
            Cannot generate code
          </h2>
          <p className="text-red-800 dark:text-red-100">
            Please fix the JSON errors in the Config tab.
          </p>
        </div>
      </div>
    );
  }

  const code = generateFormCode(formConfig);

  return (
    <div id="panel-code" role="tabpanel" aria-labelledby="tab-code">
      <h2 className="text-xl font-semibold">Form Code</h2>

      <p
        id={codeHintId}
        className="text-xs mb-6 text-gray-600 dark:text-gray-400"
      >
        A React + TypeScript component of your form. It needs the{' '}
        <code className="px-1.5 py-0.5 bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
          react-hook-form
        </code>{' '}
        package.
      </p>

      <div className="border border-gray-500 rounded-md dark:border-gray-400">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-500 bg-gray-100 rounded-t-md dark:border-gray-400 dark:bg-neutral-900">
          <span className="font-mono text-sm text-gray-700 dark:text-neutral-300">
            GeneratedForm.tsx
          </span>
          <CopyButton text={code} />
        </div>

        <CodeMirror
          value={code}
          readOnly
          extensions={[
            javascript({ jsx: true, typescript: true }),
            EditorView.contentAttributes.of({
              'aria-label': 'Generated React code',
              'aria-describedby': codeHintId,
            }),
          ]}
          className="max-h-128 overflow-auto rounded-b-md focus-within:[outline-style:auto] focus-within:-outline-offset-2 [&_.cm-editor.cm-focused]:outline-none!"
          theme={isDarkMode ? 'dark' : 'light'}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              (event.target as HTMLElement).blur();
            }
          }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            closeBrackets: false,
            autocompletion: false,
          }}
        />
      </div>
    </div>
  );
};
