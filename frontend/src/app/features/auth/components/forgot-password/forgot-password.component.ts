import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      this.authService.sendResetPasswordLink(email!).subscribe(
        (response:any) => {
          console.log("responseee",response)
          this.toastr.success('Password reset link sent to your email!', 'Success');
          this.router.navigate(['/login']);
        },
        (error:any) => {
          console.log("Email Error: ",error);
          this.toastr.error('Error sending reset link, please try again.', 'Error');
        }
      );
    }
  }
}
