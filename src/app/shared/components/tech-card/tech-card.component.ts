import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-tech-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tech-card.component.html',
})
export class TechCardComponent {
  icon = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
}
