import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve possuir 5 badges definidos', () => {
    expect(component.badges.length).toBe(5);
  });

  it('deve possuir 6 tech cards definidos', () => {
    expect(component.techs.length).toBe(6);
  });

  it('deve renderizar o título principal', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Projeto Modelo Angular');
  });

  it('deve renderizar todos os badges', () => {
    const el = fixture.nativeElement as HTMLElement;
    const badges = el.querySelectorAll('app-badge');
    expect(badges.length).toBe(component.badges.length);
  });

  it('deve renderizar todos os tech cards', () => {
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('app-tech-card');
    expect(cards.length).toBe(component.techs.length);
  });
});
