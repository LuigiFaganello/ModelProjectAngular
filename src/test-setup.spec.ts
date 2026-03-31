import { MatIconRegistry } from '@angular/material/icon';
import type { SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { patchMatIconRegistryForTests } from './test-setup';

describe('Global test setup (MatIconRegistry stub)', () => {
  beforeAll(() => {
    expect(patchMatIconRegistryForTests()).toBeTrue();
  });

  it('deve retornar um SVG mínimo para qualquer ícone solicitado', async () => {
    // O arquivo src/test-setup.ts faz monkey-patch no prototype.
    // Aqui exercitamos a função para cobrir lines/functions.
    const svg = await firstValueFrom(MatIconRegistry.prototype.getNamedSvgIcon('any', 'ns'));

    expect(svg).toBeTruthy();
    expect(svg instanceof SVGElement).toBeTrue();
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('deve tornar métodos add* no-ops fluentes (retornam this)', () => {
    const self = {} as unknown as MatIconRegistry;
    const safeUrl = '' as unknown as SafeResourceUrl;
    const safeHtml = '' as unknown as SafeHtml;

    expect(MatIconRegistry.prototype.addSvgIcon.call(self, 'x', safeUrl)).toBe(self);
    expect(MatIconRegistry.prototype.addSvgIconLiteral.call(self, 'x', safeHtml)).toBe(self);
    expect(MatIconRegistry.prototype.addSvgIconInNamespace.call(self, 'ns', 'x', safeUrl)).toBe(
      self,
    );
    expect(
      MatIconRegistry.prototype.addSvgIconLiteralInNamespace.call(self, 'ns', 'x', safeHtml),
    ).toBe(self);
  });

  it('deve retornar false se ocorrer erro ao aplicar patch', () => {
    const originalDefineProperty = Object.defineProperty;
    const objectWithDefineProperty = Object as unknown as {
      defineProperty: typeof Object.defineProperty;
    };

    try {
      objectWithDefineProperty.defineProperty = (() => {
        throw new Error('boom');
      }) as unknown as typeof Object.defineProperty;

      expect(patchMatIconRegistryForTests()).toBeFalse();
    } finally {
      Object.defineProperty = originalDefineProperty;
    }
  });
});
