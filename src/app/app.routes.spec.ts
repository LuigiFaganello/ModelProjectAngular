import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { HomeComponent } from './features/home/home.component';
import { routes } from './app.routes';

describe('App Routes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('deve carregar HomeComponent na rota raiz "/"', async () => {
    const harness = await RouterTestingHarness.create();
    const instance = await harness.navigateByUrl('/', HomeComponent);
    expect(instance).toBeInstanceOf(HomeComponent);
  });

  it('deve redirecionar rotas desconhecidas para "/"', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/rota-inexistente', HomeComponent);
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
