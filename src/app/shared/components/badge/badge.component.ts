import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

type BadgeVariant = 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()" class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  label = input.required<string>();
  variant = input<BadgeVariant>('primary');

  protected readonly classes = computed(() => {
    const map: Record<BadgeVariant, string> = {
      primary: 'bg-primary-100 text-primary-700',
      secondary: 'bg-secondary-100 text-secondary-700',
      accent: 'bg-orange-100 text-orange-700',
    };
    return map[this.variant()];
  });
}
