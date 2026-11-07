'use client';

import { FC, KeyboardEvent, useState } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { codeVariants } from '@/constants';
import { useFormContext } from '@/context/FormContext';
import { generateFormCode } from '@/generateFormCode';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { getNextTabIndex } from '@/utils';
import { CopyButton } from './components/CopyButton';

const codeHintId = 'form-code-hint';

export const CodeTab: FC = () => {
  const { formConfig, parseError } = useFormContext();
  const isDarkMode = useIsDarkMode();
  const [activeVariant, setActiveVariant] = useState(codeVariants[0]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const nextIndex = getNextTabIndex(event.key, index, codeVariants.length);

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    document.getElementById(`tab-code-${codeVariants[nextIndex].id}`)?.focus();
  };

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

  const code = generateFormCode(formConfig, activeVariant.theme);

  return (
    <div id="panel-code" role="tabpanel" aria-labelledby="tab-code">
      <h2 className="text-xl font-semibold">Form Code</h2>

      <div
        role="tablist"
        aria-label="Code variants"
        className="flex gap-6 my-3 border-b border-gray-200 dark:border-gray-700"
      >
        {codeVariants.map((variant, index) => {
          const isActive = variant === activeVariant;

          return (
            <button
              key={variant.id}
              id={`tab-code-${variant.id}`}
              type="button"
              role="tab"
              aria-controls={`panel-code-${variant.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveVariant(variant)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`pt-2 pb-1 px-1 border-b-2 text-sm font-medium ${
                isActive
                  ? 'border-green-600 text-green-700 dark:border-green-500 dark:text-green-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-300'
              }`}
            >
              {variant.label}
            </button>
          );
        })}
      </div>

      <p
        id={codeHintId}
        className="text-xs mb-6 text-gray-600 dark:text-gray-400"
      >
        A React + TypeScript component of your form. It needs the{' '}
        <code className="px-1.5 py-0.5 bg-gray-200 border border-gray-300 text-gray-700 rounded dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-300">
          react-hook-form
        </code>{' '}
        package
        {activeVariant.requirement && ` and ${activeVariant.requirement}`}.
      </p>

      <div
        id={`panel-code-${activeVariant.id}`}
        role="tabpanel"
        aria-labelledby={`tab-code-${activeVariant.id}`}
        className="border border-gray-500 rounded-md dark:border-gray-400"
      >
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
