import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthStore } from '../../../stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly isLoading = this.authStore.isLoading;
  readonly authError = this.authStore.error;
  readonly showPassword = signal(false);

  readonly loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  ngOnInit(): void {
    this.initializeLoginForm();
    this.checkAuthError();
  }

  async onSubmit(): Promise<void> {
    if (!this.loginForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const credentials = this.getLoginCredentials();
    await this.performLogin(credentials);
  }

  onTogglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  onNavigateToRegister(): void {
    void this.router.navigate(['/auth/register']);
  }

  onForgotPassword(): void {
    // TODO: Implement forgot password functionality
    console.warn('Forgot password functionality not yet implemented');
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    
    if (!field?.touched || !field.errors) {
      return null;
    }

    return this.formatFieldError(fieldName, field.errors);
  }

  private initializeLoginForm(): void {
    // Pre-fill email if available from localStorage
    const savedEmail = this.getSavedEmail();
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail });
    }
  }

  private checkAuthError(): void {
    // Clear any previous auth errors when component initializes
    if (this.authError()) {
      // Reset error after a delay to show it briefly
      setTimeout(() => {
        // AuthStore should have a method to clear errors
        console.warn('Auth error:', this.authError());
      }, 100);
    }
  }

  private getLoginCredentials() {
    const formValue = this.loginForm.value;
    return {
      email: formValue.email.trim(),
      password: formValue.password,
      rememberMe: formValue.rememberMe
    };
  }

  private async performLogin(credentials: any): Promise<void> {
    try {
      // Use the AuthStore login method
      await this.authStore.login({
        email: credentials.email,
        password: credentials.password
      });
      
      if (credentials.rememberMe) {
        this.saveEmailToStorage(credentials.email);
      }

      // Navigate to dashboard on successful login
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login failed:', error);
      // Error handling is managed by AuthStore - it will update the error signal
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
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
      return `Password must be at least ${requiredLength} characters`;
    }

    return `${this.getFieldDisplayName(fieldName)} is invalid`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      email: 'Email',
      password: 'Password'
    };
    
    return displayNames[fieldName] || fieldName;
  }

  private getSavedEmail(): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem('rememberedEmail');
      }
      return null;
    } catch {
      return null;
    }
  }

  private saveEmailToStorage(email: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('rememberedEmail', email);
      }
    } catch (error) {
      console.warn('Failed to save email to localStorage:', error);
    }
  }
} 