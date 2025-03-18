import { jest } from '@jest/globals';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: unknown) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Range.prototype.getClientRects = function (): DOMRectList {
  return {
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* (): Generator<DOMRect, undefined, unknown> {
      yield new DOMRect();
      return undefined;
    },
  };
};
