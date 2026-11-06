export type FormTheme = Record<
  | 'title'
  | 'form'
  | 'field'
  | 'textNumDateRow'
  | 'textAreaRow'
  | 'labelCell'
  | 'labelBeforeControl'
  | 'labelAfterControl'
  | 'requiredMark'
  | 'requiredText'
  | 'controlCell'
  | 'textNumDateInput'
  | 'textArea'
  | 'checkboxRow'
  | 'checkbox'
  | 'radioRow'
  | 'radioOptionRow'
  | 'radio'
  | 'legend'
  | 'error'
  | 'gridError'
  | 'buttons'
  | 'button'
  | 'submitButton',
  string
>;

const defineFormTheme = <const T extends FormTheme>(theme: T) => theme;

export const defaultFormTheme = defineFormTheme({
  title: 'text-xl font-bold mb-5',
  form: 'space-y-5',
  field: 'relative mb-4 w-full',
  textNumDateRow: 'grid grid-cols-[20%_80%] items-center w-full',
  textAreaRow: 'grid grid-cols-[20%_80%] items-baseline w-full',
  labelCell: 'wrap-break-word',
  labelBeforeControl: 'mr-1.5 block text-sm font-medium',
  labelAfterControl: 'ml-1.5 block text-sm font-medium',
  requiredMark: 'ml-1 text-red-600 dark:text-red-400',
  requiredText: 'sr-only',
  controlCell: 'w-full',
  textNumDateInput:
    'p-3 block w-full border border-gray-500 rounded dark:border-gray-400 placeholder:text-gray-500 dark:placeholder:text-gray-400',
  textArea:
    'p-3 block w-full border border-gray-500 rounded dark:border-gray-400 placeholder:text-gray-600 dark:placeholder:text-gray-400',
  checkboxRow: 'flex items-center',
  checkbox: 'h-4 w-4',
  radioRow: 'flex items-center',
  radioOptionRow: 'mb-1 flex items-center',
  radio: 'h-4 w-4 border border-gray-400 focus:ring-blue-500',
  legend: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  error: 'mt-1 text-sm text-red-600 dark:text-red-400',
  gridError: 'mt-1 text-sm text-red-600 dark:text-red-400 ml-[calc(20%)]',
  buttons: 'flex justify-end space-x-3 pt-4',
  button:
    'px-4 py-2 block rounded border border-gray-500 bg-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-300 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-neutral-700',
  submitButton:
    'px-4 py-2 block bg-blue-600 text-white rounded hover:bg-linear-to-r from-green-400 to-lime-500 hover:text-black',
});
