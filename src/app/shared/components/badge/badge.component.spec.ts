import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('label', 'Angular');
  });

  it('deve criar o componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir o label informado', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Angular');
  });

  it('deve aplicar a classe primary por padrão', () => {
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.className).toContain('bg-primary-100');
    expect(span.className).toContain('text-primary-700');
  });

  it('deve aplicar a classe secondary quando variant="secondary"', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.className).toContain('bg-secondary-100');
    expect(span.className).toContain('text-secondary-700');
  });

  it('deve aplicar a classe accent quando variant="accent"', () => {
    fixture.componentRef.setInput('variant', 'accent');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.className).toContain('bg-orange-100');
    expect(span.className).toContain('text-orange-700');
  });
});
