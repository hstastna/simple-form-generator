import { describe, it, expect } from '@jest/globals';
import { formButtonSchema } from '@/schemas/formButtonSchema';

describe('accessible name', () => {
  it('rejects a button with no naming attribute', () => {
    expect(formButtonSchema.safeParse({ type: 'submit' }).success).toBe(false);
  });

  it('accepts aria-labelledby instead of the visible text', () => {
    expect(
      formButtonSchema.safeParse({ type: 'submit', 'aria-labelledby': 'h' })
        .success
    ).toBe(true);
  });
});
