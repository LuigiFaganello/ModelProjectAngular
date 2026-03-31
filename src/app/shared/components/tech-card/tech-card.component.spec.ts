import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechCardComponent } from './tech-card.component';

describe('TechCardComponent', () => {
  let fixture: ComponentFixture<TechCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TechCardComponent);
    fixture.componentRef.setInput('icon', '🅰️');
    fixture.componentRef.setInput('title', 'Angular');
    fixture.componentRef.setInput('description', 'Framework para SPAs.');
  });

  it('deve criar o componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir o icon informado', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('🅰️');
  });

  it('deve exibir o title informado', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h3')?.textContent?.trim()).toBe('Angular');
  });

  it('deve exibir a description informada', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('p')?.textContent?.trim()).toBe('Framework para SPAs.');
  });
});
