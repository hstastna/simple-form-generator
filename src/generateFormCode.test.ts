import { describe, it, expect } from '@jest/globals';
import ts from 'typescript';
import { DEFAULT_FORM_CONFIG } from '@/constants';
import { generateFormCode } from '@/generateFormCode';
import { FormConfig, formConfigSchema } from '@/schemas/formConfigSchema';
import { getValidationRules } from '@/utils';

const generate = (config: unknown) =>
  generateFormCode(formConfigSchema.parse(config));

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
