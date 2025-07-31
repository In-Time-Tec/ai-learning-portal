declare module 'jest-axe' {
  export function axe(container: Element | Document): Promise<any>;
  export const toHaveNoViolations: any;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}