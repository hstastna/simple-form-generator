import { describe, it, expect } from '@jest/globals';
import { formFieldSchema } from '@/schemas/formFieldSchema';
import { formButtonSchema } from '@/schemas/formButtonSchema';

describe('accessible name', () => {
  it('rejects a field and a button with no naming attribute', () => {
    expect(formFieldSchema.safeParse({ type: 'checkbox' }).success).toBe(false);
    expect(formButtonSchema.safeParse({ type: 'submit' }).success).toBe(false);
  });

  it('accepts aria-label and aria-labelledby instead of the visible text', () => {
    expect(
      formFieldSchema.safeParse({ type: 'checkbox', 'aria-label': 'Agree' })
        .success
    ).toBe(true);
    expect(
      formButtonSchema.safeParse({ type: 'submit', 'aria-labelledby': 'h' })
        .success
    ).toBe(true);
  });

  it('points at the attribute to add', () => {
    const result = formFieldSchema.safeParse({ type: 'text' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['label']);
  });
});
