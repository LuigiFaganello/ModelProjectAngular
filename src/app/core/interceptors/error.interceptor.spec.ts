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
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    consoleErrorSpy = spyOn(console, 'error');
  });

  afterEach(() => httpTesting.verify());

  it('deve deixar respostas bem-sucedidas passarem sem alteração', () => {
    let result: unknown;
    http.get('/api/resource').subscribe((res) => (result = res));

    const req = httpTesting.expectOne('/api/resource');
    req.flush({ data: 'ok' });

    expect(result).toEqual({ data: 'ok' });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('deve registrar erros HTTP e re-lançá-los', (done) => {
    http.get('/api/resource').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
        expect(consoleErrorSpy).toHaveBeenCalled();
        done();
      },
    });

    const req = httpTesting.expectOne('/api/resource');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('deve registrar erros 401', (done) => {
    http.get('/api/secure').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(401);
        expect(consoleErrorSpy).toHaveBeenCalledWith(jasmine.stringContaining('[HTTP 401]'));
        done();
      },
    });

    const req = httpTesting.expectOne('/api/secure');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('deve usar a mensagem de error.error.message quando disponível', (done) => {
    http.get('/api/resource').subscribe({
      error: () => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(jasmine.stringContaining('Token expirado'));
        done();
      },
    });

    const req = httpTesting.expectOne('/api/resource');
    req.flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('deve re-lançar erros não-HTTP sem logar', (done) => {
    const jsError = new Error('JavaScript error');
    const mockNext: HttpHandlerFn = () => throwError(() => jsError);

    errorInterceptor(new HttpRequest('GET', '/test'), mockNext).subscribe({
      error: (err: unknown) => {
        expect(err).toBe(jsError);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
