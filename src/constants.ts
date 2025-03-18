export const tabs = ['config', 'result'];

export const DEFAULT_FORM_CONFIG = JSON.stringify(
  {
    title: 'Sample Form',
    items: [
      {
        id: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        type: 'reset',
      },
      {
        text: 'Save',
        type: 'submit',
      },
    ],
  },
  null,
  2
);
