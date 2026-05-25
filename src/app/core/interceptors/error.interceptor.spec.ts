import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('deve deixar respostas bem-sucedidas passarem sem alteração', () => {
    let result: unknown;
    http.get('/api/resource').subscribe((res) => (result = res));

    httpTesting.expectOne('/api/resource').flush({ data: 'ok' });

    expect(result).toEqual({ data: 'ok' });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('deve registrar erros HTTP e re-lançá-los', () => {
    let caught: HttpErrorResponse | undefined;
    http.get('/api/resource').subscribe({ error: (err: HttpErrorResponse) => (caught = err) });

    httpTesting
      .expectOne('/api/resource')
      .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(caught?.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[HTTP 500]'));
  });

  it('deve registrar erros 401', () => {
    let caught: HttpErrorResponse | undefined;
    http.get('/api/secure').subscribe({ error: (err: HttpErrorResponse) => (caught = err) });

    httpTesting
      .expectOne('/api/secure')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(caught?.status).toBe(401);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[HTTP 401]'));
  });

  it('deve usar a mensagem de error.error.message quando disponível', () => {
    http.get('/api/resource').subscribe({ error: () => undefined });

    httpTesting
      .expectOne('/api/resource')
      .flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Token expirado'));
  });

  it('deve re-lançar erros não-HTTP sem logar', () => {
    const jsError = new Error('JavaScript error');
    const mockNext: HttpHandlerFn = () => throwError(() => jsError);

    let caught: unknown;
    errorInterceptor(new HttpRequest('GET', '/test'), mockNext).subscribe({
      error: (err: unknown) => (caught = err),
    });

    expect(caught).toBe(jsError);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
