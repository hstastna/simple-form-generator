import { describe, it, expect } from '@jest/globals';
import { formButtonSchema } from '@/schemas/formButtonSchema';
import { formFieldSchema } from '@/schemas/formFieldSchema';

describe('event handler attributes', () => {
  it('accepts a handler name on a button', () => {
    const result = formButtonSchema.safeParse({
      text: 'Clear',
      onClick: 'clear',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a handler name on a field', () => {
    const result = formFieldSchema.safeParse({
      type: 'text',
      onFocus: 'saveDraft',
    });

    expect(result.success).toBe(true);
  });

  it('rejects anything that is not a handler name', () => {
    expect(formButtonSchema.safeParse({ onClick: 'clear()' }).success).toBe(
      false
    );
    expect(formButtonSchema.safeParse({ onClick: 42 }).success).toBe(false);
  });
});
