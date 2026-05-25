import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '@core/services/token.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  function setup(token: string | null): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(TokenService), 'getToken').mockReturnValue(token);
  }

  afterEach(() => {
    httpTesting.verify();
  });

  it('não deve adicionar Authorization quando não há token', () => {
    setup(null);
    http.get('/api/resource').subscribe();

    const req = httpTesting.expectOne('/api/resource');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('deve adicionar o header Authorization com Bearer quando há token', () => {
    setup('my-jwt-token');
    http.get('/api/resource').subscribe();

    const req = httpTesting.expectOne('/api/resource');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it('deve preservar os outros headers da requisição original', () => {
    setup('token-xyz');
    http.get('/api/resource', { headers: { 'X-Custom': 'value' } }).subscribe();

    const req = httpTesting.expectOne('/api/resource');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-xyz');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    req.flush({});
  });
});
