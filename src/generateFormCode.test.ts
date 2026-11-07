import { describe, it, expect } from '@jest/globals';
import ts from 'typescript';
import { DEFAULT_FORM_CONFIG } from '@/constants';
import { defaultFormTheme, FormTheme } from '@/formThemes';
import { generateFormCode } from '@/generateFormCode';
import { FormConfig, formConfigSchema } from '@/schemas/formConfigSchema';
import { getValidationRules } from '@/utils';

const generate = (config: unknown, theme?: FormTheme) =>
  generateFormCode(formConfigSchema.parse(config), theme);

const submit = { text: 'Save', type: 'submit' };

const kitchenSinkConfig = {
  title: 'Say "hi" & {wave} <now>\nplease',
  items: [
    {
      id: 'full-name',
      type: 'text',
      label: 'Name "quoted" & {braced} <tag>',
      placeholder: 'C:\\path\\to "file" & more',
      pattern: '[a-z]+/"[0-9]*',
      title: 'letters/"digits"',
      minLength: 2,
      maxLength: 20,
      required: true,
      style: { color: 'red', backgroundColor: 'white' },
      onFocus: 'default',
      onChange: 'trackChange',
      onBlur: 'default',
      'aria-describedby': 'name-hint',
    },
    { type: 'number', label: 'Age', min: 18, max: 99, step: 1 },
    {
      id: 'start',
      type: 'date',
      label: 'Start',
      min: '2026-01-01',
      max: '2026-12-31',
    },
    {
      id: 'bio',
      type: 'textarea',
      label: 'Bio',
      rows: 3,
      text: 'Line 1\nLine "2"',
    },
    { id: 'agree', type: 'checkbox', label: "I'm in", required: true },
    {
      id: 'locked',
      type: 'text',
      label: 'Locked',
      disabled: true,
      required: true,
    },
    {
      id: 'plan',
      type: 'radio',
      label: 'Plan',
      'aria-describedby': 'plan-hint',
      autoFocus: true,
      name: 'plan',
      onKeyDown: 'default',
      options: [
        { value: 'basic', label: 'Basic' },
        { id: 'plan-pro', value: 'pro', label: 'Pro', required: true },
        { value: 'team', disabled: true, 'aria-describedby': 'team-hint' },
      ],
    },
  ],
  buttons: [
    { text: 'Clear & restart', onClick: 'clear' },
    { text: 'Reset', type: 'reset' },
    { 'aria-label': 'Help', onClick: 'default' },
    submit,
  ],
};

const getDiagnostics = (code: string) =>
  ts.transpileModule(code, {
    fileName: 'GeneratedForm.tsx',
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve },
  }).diagnostics;

describe('generateFormCode', () => {
  it('generates the component for the default config', () => {
    expect(generate(JSON.parse(DEFAULT_FORM_CONFIG))).toBe(`"use client";

import { SyntheticEvent } from "react";
import { useForm } from "react-hook-form";

type FormValues = Record<string, string | number | boolean>;

export const GeneratedForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const handlers = {
    reset: (event: SyntheticEvent) => {
      event.preventDefault();

      if (
        window.confirm(
          "Are you sure you want to reset the form? All data will be lost."
        )
      ) {
        reset();
      }
    },
  };

  const onSubmit = (data: FormValues) => {
    // TODO: send the data
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="form-title"
    >
      <h2 id="form-title">Sample Form</h2>

      <div>
        <label htmlFor="name">
          Name<span aria-hidden="true"> *</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          required
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name", {
            required: "This field is required",
          })}
        />
        {errors.name && (
          <p id="name-error" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <input
          id="newsletter"
          type="checkbox"
          aria-invalid={errors.newsletter ? "true" : undefined}
          aria-describedby={errors.newsletter ? "newsletter-error" : undefined}
          {...register("newsletter")}
        />
        <label htmlFor="newsletter">Subscribe to the newsletter</label>
        {errors.newsletter && (
          <p id="newsletter-error" role="alert">
            {errors.newsletter.message}
          </p>
        )}
      </div>

      <div>
        <button type="reset" onClick={handlers.reset}>
          Cancel
        </button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
};
`);
  });

  it('generates valid TSX for a config full of special characters', () => {
    expect(getDiagnostics(generate(kitchenSinkConfig))).toEqual([]);
  });

  it('mirrors the radio group of the Result tab', () => {
    const code = generate(kitchenSinkConfig);

    expect(code).toContain('<fieldset\n          role="radiogroup"');
    expect(code).toContain('Plan<span aria-hidden="true"> *</span>');
    expect(code).toContain('id="plan-0"');
    expect(code).toContain('id="plan-pro"');
    expect(code).toContain('id="plan-2"');
    expect(code.match(/autoFocus/g)).toHaveLength(1);
    expect(code).not.toContain('name="plan"');
    expect(code.match(/\{\.\.\.register\("plan", \{/g)).toHaveLength(3);
    expect(code).toContain(
      'errors.plan ? "team-hint plan-error" : "team-hint"'
    );
  });

  it('merges the config aria-describedby with the error id', () => {
    expect(generate(kitchenSinkConfig)).toContain(
      'aria-describedby={\n            errors["full-name"] ? "name-hint full-name-error" : "name-hint"\n          }'
    );
  });
});

describe('handlers', () => {
  it('omits the handlers, reset and SyntheticEvent when no handler is used', () => {
    const code = generate({
      items: [{ type: 'text', label: 'Name' }],
      buttons: [submit],
    });

    expect(code).not.toContain('handlers');
    expect(code).not.toContain('reset');
    expect(code).not.toContain('SyntheticEvent');
  });

  it('gives a reset button the reset handler without an onClick key', () => {
    const code = generate({
      items: [],
      buttons: [{ text: 'Reset', type: 'reset' }],
    });

    expect(code).toContain('<button type="reset" onClick={handlers.reset}>');
    expect(code).toContain('import { SyntheticEvent } from "react";');
  });

  it('resets react-hook-form when a reset button runs a custom handler', () => {
    const code = generate({
      items: [],
      buttons: [{ text: 'Reset', type: 'reset', onClick: 'logReset' }],
    });

    expect(code).toContain('<button type="reset" onClick={handlers.logReset}>');
    expect(code).toContain(
      'logReset: () => {\n      // TODO: implement "logReset"\n      reset();\n    },'
    );
    expect(code).toContain('const { handleSubmit, reset } = useForm');
  });

  it('imports SyntheticEvent only for the reset handler', () => {
    const code = generate({
      items: [],
      buttons: [{ text: 'Clear', onClick: 'clear' }],
    });

    expect(code).toContain('clear: () => reset(),');
    expect(code).toContain(
      'const { handleSubmit, reset } = useForm<FormValues>();'
    );
    expect(code).not.toContain('SyntheticEvent');
  });

  it('emits one stub per custom handler name, in order of use', () => {
    const code = generate(kitchenSinkConfig);

    expect(code.match(/ {4}default: \(\) => \{/g)).toHaveLength(1);
    expect(code).toContain('// TODO: implement "trackChange"');
    expect(code.indexOf('trackChange: ')).toBeLessThan(
      code.indexOf('default: ')
    );
  });

  it('passes field onChange and onBlur to register, not to the input', () => {
    const code = generate(kitchenSinkConfig);

    expect(code).toContain('onChange: handlers.trackChange,');
    expect(code).toContain('onBlur: handlers.default,');
    expect(code).not.toContain('onChange={');
    expect(code).toContain('onFocus={handlers.default}');
  });
});

describe('escaping', () => {
  const config: FormConfig = {
    title: 'Plain title',
    items: [
      {
        id: 'a',
        type: 'text',
        label: 'Plain',
        placeholder: 'C:\\no {escape} <needed>',
      },
      { id: 'b', type: 'text', label: 'Tom & Jerry', placeholder: 'say "hi"' },
    ],
    buttons: [],
  };
  const code = generateFormCode(config);

  it('keeps a plain string as a quoted attribute', () => {
    expect(code).toContain('placeholder="C:\\no {escape} <needed>"');
  });

  it('wraps a string with a quote in an expression', () => {
    expect(code).toContain('placeholder={"say \\"hi\\""}');
  });

  it('keeps plain text as JSX text and escapes the rest', () => {
    expect(code).toContain('<h2 id="form-title">Plain title</h2>');
    expect(code).toContain('<label htmlFor="b">{"Tom & Jerry"}</label>');
  });

  it('uses bracket access for an id that is no identifier', () => {
    const code = generate({
      items: [{ type: 'text', label: 'X' }],
      buttons: [],
    });

    expect(code).toContain('{errors["field-0"] && (');
  });

  it('reads the error of an id with a dot through get', () => {
    const code = generate({
      items: [{ id: 'user.name', type: 'text', label: 'Name' }],
      buttons: [],
    });

    expect(code).toContain('import { get, useForm } from "react-hook-form";');
    expect(code).toContain('{get(errors, "user.name") && (');
  });
});

describe('validation rules', () => {
  it('emits a pattern that matches what the Result tab matches', () => {
    const pattern = '[a-z]+/"[0-9]*';
    const code = generate({
      items: [{ id: 'code', type: 'text', label: 'Code', pattern }],
      buttons: [],
    });
    const emitted = code.match(/value: (new RegExp\(.*\)),/)?.[1] ?? '';
    const rule = getValidationRules({ type: 'text', pattern }).pattern?.value;
    const regExp = new Function(`return ${emitted}`)() as RegExp;

    expect(regExp.source).toBe(rule?.source);
    expect(regExp.flags).toBe('v');
    expect(regExp.test('abc/"123')).toBe(true);
    expect(regExp.test('abc/123')).toBe(false);
  });

  it('keeps only the disabled rule on a disabled field', () => {
    const code = generate(kitchenSinkConfig);

    expect(code).toContain(
      '{...register("locked", {\n            disabled: true,\n          })}'
    );
  });

  it('calls register without options when no rule applies', () => {
    const code = generate({
      items: [{ id: 'nick', type: 'text', label: 'Nick' }],
      buttons: [],
    });

    expect(code).toContain('{...register("nick")}');
  });
});

describe('long lines', () => {
  const id = 'a-very-long-field-identifier-that-goes-on-and-on-forever';
  const code = generate({
    items: [{ id, type: 'text', label: 'Long' }],
    buttons: [],
  });

  it('keeps a tag with one long string attribute on one line', () => {
    expect(code).toContain(`<label htmlFor="${id}">`);
  });

  it('splits a condition at "?" and ":" when it is still too long', () => {
    expect(code).toContain(
      [
        'aria-invalid={',
        `            errors["${id}"]`,
        '              ? "true"',
        '              : undefined',
        '          }',
      ].join('\n')
    );
  });

  it('puts each attribute of a long error message on its own line', () => {
    expect(code).toContain(
      [
        '<p',
        `            id="${id}-error"`,
        '            role="alert"',
        '          >',
      ].join('\n')
    );
  });
});

describe('theme', () => {
  it('adds the theme classes and the Result tab wrappers to the default config', () => {
    expect(generate(JSON.parse(DEFAULT_FORM_CONFIG), defaultFormTheme))
      .toBe(`"use client";

import { SyntheticEvent } from "react";
import { useForm } from "react-hook-form";

type FormValues = Record<string, string | number | boolean>;

export const GeneratedForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const handlers = {
    reset: (event: SyntheticEvent) => {
      event.preventDefault();

      if (
        window.confirm(
          "Are you sure you want to reset the form? All data will be lost."
        )
      ) {
        reset();
      }
    },
  };

  const onSubmit = (data: FormValues) => {
    // TODO: send the data
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-labelledby="form-title"
    >
      <h2 id="form-title" className="text-xl font-bold mb-5">
        Sample Form
      </h2>

      <div className="relative mb-4 w-full">
        <div className="grid grid-cols-[20%_80%] items-center w-full">
          <div className="wrap-break-word">
            <label htmlFor="name" className="mr-1.5 block text-sm font-medium">
              Name
              <span
                className="ml-1 text-red-600 dark:text-red-400"
                aria-hidden="true"
              >
                *
              </span>
              <span className="sr-only">{" (required)"}</span>
            </label>
          </div>
          <div className="w-full">
            <input
              id="name"
              type="text"
              className="p-3 block w-full border border-gray-500 rounded dark:border-gray-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Enter your name"
              required
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name", {
                required: "This field is required",
              })}
            />
          </div>
        </div>
        {errors.name && (
          <p
            id="name-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400 ml-[calc(20%)]"
            role="alert"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="relative mb-4 w-full">
        <div className="flex items-center">
          <input
            id="newsletter"
            type="checkbox"
            className="h-4 w-4"
            aria-invalid={errors.newsletter ? "true" : undefined}
            aria-describedby={
              errors.newsletter ? "newsletter-error" : undefined
            }
            {...register("newsletter")}
          />
          <label
            htmlFor="newsletter"
            className="ml-1.5 block text-sm font-medium"
          >
            Subscribe to the newsletter
          </label>
        </div>
        {errors.newsletter && (
          <p
            id="newsletter-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.newsletter.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="reset"
          className="px-4 py-2 block rounded border border-gray-500 bg-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-300 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-neutral-700 enabled:cursor-pointer"
          onClick={handlers.reset}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 block bg-blue-600 text-white rounded hover:bg-linear-to-r from-green-400 to-lime-500 hover:text-black enabled:cursor-pointer"
        >
          Save
        </button>
      </div>
    </form>
  );
};
`);
  });

  it('generates valid TSX with a theme for a config full of special characters', () => {
    expect(
      getDiagnostics(generate(kitchenSinkConfig, defaultFormTheme))
    ).toEqual([]);
  });

  it('lets a className in the JSON config replace the theme class', () => {
    const code = generate(
      {
        items: [
          { id: 'nick', type: 'text', label: 'Nick', className: 'own-input' },
        ],
        buttons: [{ text: 'Save', type: 'submit', className: 'own-button' }],
      },
      defaultFormTheme
    );

    expect(code).toContain('className="own-input"');
    expect(code).toContain('className="own-button"');
    expect(code).not.toContain(defaultFormTheme.textNumDateInput);
    expect(code).not.toContain(defaultFormTheme.submitButton);
  });

  it('renders the label cell of a grid field without a label', () => {
    const code = generate(
      {
        items: [{ id: 'nick', type: 'text', 'aria-label': 'Nick' }],
        buttons: [],
      },
      defaultFormTheme
    );

    expect(code).toContain(
      `<div className="${defaultFormTheme.labelCell}"></div>`
    );
  });

  it('keeps a legend with one long class on one line', () => {
    expect(generate(kitchenSinkConfig, defaultFormTheme)).toContain(
      `<legend className="${defaultFormTheme.legend}">`
    );
  });
});

describe('theme date class', () => {
  it('watches an empty date to pick the empty date class', () => {
    const code = generate(
      { items: [{ id: 'start', type: 'date', label: 'Start' }], buttons: [] },
      defaultFormTheme
    );

    expect(code).toContain(
      'import { useForm, useWatch } from "react-hook-form";'
    );
    expect(code).toContain('    register,\n    control,\n    handleSubmit,\n');
    expect(code).toContain(
      'const startValue = useWatch({ control, name: "start" });'
    );
    expect(code).toContain(
      [
        'className={',
        '                startValue',
        `                  ? "${defaultFormTheme.dateInput}"`,
        `                  : "${defaultFormTheme.emptyDateInput}"`,
        '              }',
      ].join('\n')
    );
  });

  it('passes a preset date to useWatch', () => {
    const code = generate(
      {
        items: [
          {
            id: 'end-date',
            type: 'date',
            label: 'End',
            defaultValue: '2026-11-06',
          },
        ],
        buttons: [],
      },
      defaultFormTheme
    );

    expect(code).toContain(
      'const endDateValue = useWatch({\n    control,\n    name: "end-date",\n    defaultValue: "2026-11-06",\n  });'
    );
  });

  it('gives two date ids with the same camel case two variables', () => {
    const code = generate(
      {
        items: [
          { id: 'end-date', type: 'date', label: 'End' },
          { id: 'end.date', type: 'date', label: 'End 2' },
        ],
        buttons: [],
      },
      defaultFormTheme
    );

    expect(code).toContain(
      'const endDateValue = useWatch({ control, name: "end-date" });'
    );
    expect(code).toContain(
      'const _endDateValue = useWatch({ control, name: "end.date" });'
    );
  });

  it('sets the date class of a pinned date without watching it', () => {
    const code = generate(
      {
        items: [
          { id: 'start', type: 'date', label: 'Start', value: '2026-11-06' },
        ],
        buttons: [],
      },
      defaultFormTheme
    );

    expect(code).toContain(`className="${defaultFormTheme.dateInput}"`);
    expect(code).not.toContain('useWatch');
  });
});
