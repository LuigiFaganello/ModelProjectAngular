import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './global-error.handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler],
    });

    handler = TestBed.inject(GlobalErrorHandler);
    consoleErrorSpy = spyOn(console, 'error');
  });

  it('deve criar o handler', () => {
    expect(handler).toBeTruthy();
  });

  it('deve registrar objetos Error no console', () => {
    const error = new Error('algo deu errado');
    handler.handleError(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[GlobalErrorHandler]', error);
  });

  it('deve registrar strings de erro', () => {
    handler.handleError('erro em string');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[GlobalErrorHandler]', 'erro em string');
  });

  it('deve registrar erros desconhecidos (objetos genéricos)', () => {
    const error = { code: 42, reason: 'timeout' };
    handler.handleError(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[GlobalErrorHandler]', error);
  });

  it('deve registrar undefined', () => {
    handler.handleError(undefined);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[GlobalErrorHandler]', undefined);
  });
});
