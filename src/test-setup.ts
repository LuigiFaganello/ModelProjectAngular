// Global test setup: silence Angular Material icon errors by stubbing MatIconRegistry
// This avoids noisy console.error logs when components request custom icons during tests.
import { MatIconRegistry } from '@angular/material/icon';
import { Observable, of } from 'rxjs';

export function patchMatIconRegistryForTests(): boolean {
  try {
    const proto = MatIconRegistry.prototype as unknown as Record<string, unknown>;

    const getNamedSvgIconStub = function (
      _name: string,
      _namespace?: string,
    ): Observable<SVGElement> {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      return of(svg);
    };

    const noopFluentStub = function (this: unknown) {
      return this;
    };

    Object.defineProperty(proto, 'getNamedSvgIcon', {
      value: getNamedSvgIconStub,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(proto, 'addSvgIcon', {
      value: noopFluentStub,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(proto, 'addSvgIconLiteral', {
      value: noopFluentStub,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(proto, 'addSvgIconInNamespace', {
      value: noopFluentStub,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(proto, 'addSvgIconLiteralInNamespace', {
      value: noopFluentStub,
      configurable: true,
      writable: true,
    });

    return true;
  } catch {
    return false;
  }
}

(() => {
  patchMatIconRegistryForTests();
})();
