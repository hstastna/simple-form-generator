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

  it('points at the attribute to add', () => {
    const result = formFieldSchema.safeParse({ type: 'text' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['label']);
  });
});

describe('radio', () => {
  const group = { type: 'radio', label: 'Plan', options: ['basic', 'pro'] };

  it('accepts a plain group', () => {
    expect(formFieldSchema.safeParse(group).success).toBe(true);
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
  it('rejects defaultValue, which is not an HTML content attribute', () => {
    expect(
      formFieldSchema.safeParse({
        type: 'text',
        label: 'Nick',
        defaultValue: 'x',
      }).success
    ).toBe(false);
  });

  it('rejects defaultChecked, which is not an HTML content attribute', () => {
    expect(
      formFieldSchema.safeParse({
        type: 'checkbox',
        label: 'Agree',
        defaultChecked: true,
      }).success
    ).toBe(false);
  });
});
