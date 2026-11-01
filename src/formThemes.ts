export type FormTheme = Record<
  | 'title'
  | 'form'
  | 'field'
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
  legend: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  error: 'mt-1 text-sm text-red-600 dark:text-red-400',
  gridError: 'mt-1 text-sm text-red-600 dark:text-red-400 ml-[calc(20%)]',
  buttons: 'flex justify-end space-x-3 pt-4',
  button:
    'px-4 py-2 block rounded border border-gray-500 bg-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-300 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-neutral-700',
  submitButton:
    'px-4 py-2 block bg-blue-600 text-white rounded hover:bg-linear-to-r from-green-400 to-lime-500 hover:text-black',
});
