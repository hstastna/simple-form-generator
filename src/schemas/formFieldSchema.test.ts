import { describe, it, expect } from '@jest/globals';
import { formFieldSchema } from '@/schemas/formFieldSchema';

describe('accessible name', () => {
  it('rejects a field with no naming attribute', () => {
    expect(formFieldSchema.safeParse({ type: 'checkbox' }).success).toBe(false);
  });

  it('accepts aria-label instead of the visible label', () => {
    expect(
      formFieldSchema.safeParse({ type: 'checkbox', 'aria-label': 'Agree' })
        .success
    ).toBe(true);
  });

  it('needs no name on a hidden input, which takes no label', () => {
    expect(formFieldSchema.safeParse({ type: 'hidden' }).success).toBe(true);
    expect(
      formFieldSchema.safeParse({ type: 'hidden', label: 'Token' }).success
    ).toBe(false);
  });

  it('names a button input by its value or alt, not by a label', () => {
    expect(formFieldSchema.safeParse({ type: 'submit' }).success).toBe(true);
    expect(
      formFieldSchema.safeParse({ type: 'submit', label: 'Send' }).success
    ).toBe(false);
    expect(
      formFieldSchema.safeParse({ type: 'button' }).error?.issues[0].path
    ).toEqual(['value']);
    expect(
      formFieldSchema.safeParse({ type: 'button', value: 0 }).success
    ).toBe(true);
    expect(
      formFieldSchema.safeParse({ type: 'image', src: 'go.png' }).error
        ?.issues[0].path
    ).toEqual(['alt']);
  });

  it('points at the attribute to add', () => {
    const result = formFieldSchema.safeParse({ type: 'text' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['label']);
  });
});

describe('radio', () => {
  const group = {
    type: 'radio',
    label: 'Plan',
    options: [{ value: 'basic' }, { value: 'pro' }],
  };

  it('accepts a plain group', () => {
    expect(formFieldSchema.safeParse(group).success).toBe(true);
  });

  it('accepts radio attributes on each option', () => {
    const option = {
      id: 'pro',
      value: 'pro',
      label: 'Pro',
      disabled: true,
      defaultChecked: true,
    };

    expect(
      formFieldSchema.safeParse({ ...group, options: [option] }).success
    ).toBe(true);
  });

  it('rejects a plain string as an option', () => {
    expect(
      formFieldSchema.safeParse({ ...group, options: ['basic'] }).success
    ).toBe(false);
  });

  it('accepts checked, a valid attribute on a radio input', () => {
    expect(formFieldSchema.safeParse({ ...group, checked: true }).success).toBe(
      true
    );
  });
});

describe('textarea', () => {
  const bio = { type: 'textarea', label: 'Bio' };

  it('accepts text, the custom key for the child text', () => {
    expect(
      formFieldSchema.safeParse({ ...bio, text: 'preset bio' }).success
    ).toBe(true);
  });

  it('rejects value, which a textarea has no attribute for', () => {
    expect(
      formFieldSchema.safeParse({ ...bio, value: 'preset bio' }).success
    ).toBe(false);
  });
});

describe('React-only prop names', () => {
  it('accepts defaultValue, the editable preset of an input', () => {
    expect(
      formFieldSchema.safeParse({
        type: 'text',
        label: 'Nick',
        defaultValue: 'x',
      }).success
    ).toBe(true);
  });

  it('accepts defaultChecked, the editable preset of a checkbox', () => {
    expect(
      formFieldSchema.safeParse({
        type: 'checkbox',
        label: 'Agree',
        defaultChecked: true,
      }).success
    ).toBe(true);
  });
});

describe('file', () => {
  it('rejects a preset value, which React cannot set on a file input', () => {
    const file = { type: 'file', label: 'CV' };

    expect(formFieldSchema.safeParse(file).success).toBe(true);
    expect(
      formFieldSchema.safeParse({ ...file, defaultValue: 'cv.pdf' }).error
        ?.issues[0].path
    ).toEqual(['defaultValue']);
  });
});

describe('select', () => {
  const select = {
    type: 'select',
    label: 'Country',
    options: [{ value: 'cz', label: 'Czechia' }, { value: 'sk' }],
  };

  it('accepts options and a list of preset values for multiple', () => {
    expect(
      formFieldSchema.safeParse({
        ...select,
        multiple: true,
        defaultValue: ['cz', 'sk'],
      }).success
    ).toBe(true);
  });

  it('takes a list of values only on a multiple select, as React does', () => {
    expect(
      formFieldSchema.safeParse({
        ...select,
        multiple: true,
        defaultValue: 'cz',
      }).error?.issues[0].path
    ).toEqual(['defaultValue']);
    expect(
      formFieldSchema.safeParse({ ...select, value: ['cz'] }).error?.issues[0]
        .path
    ).toEqual(['value']);
  });

  it('rejects selected on an option, as React presets the select instead', () => {
    expect(
      formFieldSchema.safeParse({
        ...select,
        options: [{ value: 'cz', selected: true }],
      }).success
    ).toBe(false);
  });
});
