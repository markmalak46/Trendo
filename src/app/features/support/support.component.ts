import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-support',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private zone = inject(NgZone);

  supportForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and going to the Orders page. You will find real-time updates and a tracking link there.',
      isOpen: false
    },
    {
      question: 'What is your return and exchange policy?',
      answer: 'We offer a 30-day return policy for unused and unworn items in their original packaging with tags attached. Please contact us to initiate a return. Exchanges are processed as a return and a new order.',
      isOpen: false
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to over 50 countries worldwide. International shipping costs and estimated delivery times will be calculated at checkout based on your location.',
      isOpen: false
    },
    {
      question: 'How do I change or cancel my order?',
      answer: 'Please contact us within 1 hour of placing your order if you need to modify or cancel it. Once an order is processed and sent to fulfillment, it cannot be changed.',
      isOpen: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All transactions are securely encrypted.',
      isOpen: false
    },
    {
      question: 'What should I do if I receive a defective item?',
      answer: 'We apologize for the inconvenience! Please contact our support team within 7 days of receiving your order with your order number and photos of the defect, and we will arrange a replacement or refund.',
      isOpen: false
    },
    {
      question: 'How do I use a promo code?',
      answer: 'You can enter your promo code during checkout in the "Discount Code" field. Only one promo code can be applied per order.',
      isOpen: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  isLoading = false;
  isSent = false;

  onSubmit(): void {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields correctly.', 'Error');
      return;
    }

    this.isLoading = true;

    const formData = this.supportForm.value;

    emailjs.send(
      'service_4fbfcrm',
      'template_fg4fklf',
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      },
      'VrQCZy75EUvXoZD09'
    )
      .then(() => {
        this.zone.run(() => {
          this.isLoading = false;
          this.isSent = true;

          this.toastr.success('Message sent successfully!', 'Done');

          setTimeout(() => {
            this.isSent = false;
            this.supportForm.reset();
          }, 3000);
        });

      })
      .catch(() => {
        this.zone.run(() => {
          this.isLoading = false;
          this.toastr.error('Failed to send message', 'Error');
        });
      });
  }

  openWhatsApp(): void {
  const phone = '201224840495'; // حط رقمك هنا بصيغة دولية بدون +
  const message = encodeURIComponent('Hello, I need assistance');

  const url = `https://wa.me/${phone}?text=${message}`;

  window.open(url, '_blank');
}
}
