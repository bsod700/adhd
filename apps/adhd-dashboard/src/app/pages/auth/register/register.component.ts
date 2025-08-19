import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  readonly registerForm: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    // Component initialization
  }

  async onSubmit(): Promise<void> {
    if (!this.registerForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const userData = this.getUserData();
    await this.performRegistration(userData);
  }

  onTogglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  onNavigateToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);
    
    if (!field?.touched || !field.errors) {
      return null;
    }

    return this.formatFieldError(fieldName, field.errors);
  }

  private getUserData() {
    const formValue = this.registerForm.value;
    return {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
      password: formValue.password
    };
  }

  private async performRegistration(userData: any): Promise<void> {
    this.isLoading.set(true);

    try {
      // Simulate API call
      await this.simulateRegistrationRequest(userData);
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async simulateRegistrationRequest(userData: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.warn('Simulated registration for:', userData.email);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  private formatFieldError(fieldName: string, errors: any): string {
    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return `${this.getFieldDisplayName(fieldName)} is invalid`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password'
    };
    
    return displayNames[fieldName] || fieldName;
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }
} 