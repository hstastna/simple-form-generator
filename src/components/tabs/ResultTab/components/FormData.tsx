import { FC } from 'react';

type FormDataProps = {
  formData: Record<string, string | number | boolean>;
};

export const FormData: FC<FormDataProps> = ({ formData }) => (
  <section
    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
    aria-labelledby="form-data-heading"
  >
    <h3 id="form-data-heading" className="text-xl font-bold mb-4">
      Form Data
    </h3>

    <pre
      className="border border-gray-500 p-4 rounded overflow-x-auto text-sm dark:border-gray-400"
      role="region"
      aria-label="Submitted form data in JSON format"
      tabIndex={0}
    >
      {JSON.stringify(formData, null, 2)}
    </pre>
  </section>
);
