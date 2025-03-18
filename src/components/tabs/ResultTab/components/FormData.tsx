import { FC } from 'react';

type FormDataProps = {
  formData: Record<string, string | number | boolean>;
};

export const FormData: FC<FormDataProps> = ({ formData }) => (
  <div
    className="mt-8 pt-6 border-t border-gray-200"
    aria-labelledby="form-data-heading"
  >
    <h3 id="form-data-heading" className="text-lg font-medium mb-3">
      Form Data:
    </h3>

    <pre
      className="border border-gray-400 p-4 rounded overflow-x-auto"
      aria-label="Submitted form data in JSON format"
      tabIndex={0}
    >
      {JSON.stringify(formData, null, 2)}
    </pre>
  </div>
);
