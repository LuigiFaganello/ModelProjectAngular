import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TechCardComponent } from '@shared/components/tech-card/tech-card.component';

interface TechItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, TechCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly badges = ['Angular 21', 'Standalone', 'SSR', 'TypeScript 5', 'Tailwind CSS'];

  readonly techs: TechItem[] = [
    {
      icon: '🅰️',
      title: 'Angular 21',
      description: 'Standalone components, signals e control flow moderno com @for e @if.',
    },
    {
      icon: '🎨',
      title: 'Tailwind CSS',
      description: 'Utilitários de estilo com tema e design tokens customizados via CSS variables.',
    },
    {
      icon: '🔷',
      title: 'TypeScript 5.9',
      description: 'Strict mode completo para máxima segurança de tipos e autocompletar preciso.',
    },
    {
      icon: '💎',
      title: 'Angular Material',
      description: 'Componentes de UI acessíveis com tema integrado ao design system do projeto.',
    },
    {
      icon: '🌐',
      title: 'SSR + Hydration',
      description: 'Server-Side Rendering com event replay para melhor SEO e performance inicial.',
    },
    {
      icon: '✅',
      title: 'Karma + Jasmine',
      description: '100% de cobertura de testes como padrão, com pre-commit via Husky.',
    },
  ];
}
