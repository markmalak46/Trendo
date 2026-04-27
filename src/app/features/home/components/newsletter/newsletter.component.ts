import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.css',
})
export class NewsletterComponent {
  email = signal<string>('');
  subscribed = signal<boolean>(false);
  error = signal<string>('');

  subscribe(): void {
    const val = this.email().trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    this.error.set('');
    this.subscribed.set(true);
    this.email.set('');
  }
}
