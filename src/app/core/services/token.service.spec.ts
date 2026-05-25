import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { TokenService } from './token.service';

describe('TokenService', () => {
  function setup(platformId = 'browser'): TokenService {
    TestBed.configureTestingModule({
      providers: [TokenService, { provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.inject(TokenService);
  }

  afterEach(() => localStorage.clear());

  it('deve criar o serviço', () => {
    expect(setup()).toBeTruthy();
  });

  describe('ambiente browser', () => {
    describe('getToken', () => {
      it('deve retornar null quando não há token armazenado', () => {
        expect(setup().getToken()).toBeNull();
      });

      it('deve retornar o token armazenado no localStorage', () => {
        localStorage.setItem('auth_token', 'my-jwt-token');
        expect(setup().getToken()).toBe('my-jwt-token');
      });
    });

    describe('setToken', () => {
      it('deve armazenar o token no localStorage', () => {
        setup().setToken('new-token');
        expect(localStorage.getItem('auth_token')).toBe('new-token');
      });
    });

    describe('clearToken', () => {
      it('deve remover o token do localStorage', () => {
        localStorage.setItem('auth_token', 'some-token');
        setup().clearToken();
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('ambiente servidor (SSR)', () => {
    it('getToken deve retornar null sem acessar localStorage', () => {
      expect(setup('server').getToken()).toBeNull();
    });

    it('setToken deve ser no-op sem acessar localStorage', () => {
      const service = setup('server');
      expect(() => service.setToken('token')).not.toThrow();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('clearToken deve ser no-op sem acessar localStorage', () => {
      localStorage.setItem('auth_token', 'existing');
      const service = setup('server');
      expect(() => service.clearToken()).not.toThrow();
      expect(localStorage.getItem('auth_token')).toBe('existing');
    });
  });
});
