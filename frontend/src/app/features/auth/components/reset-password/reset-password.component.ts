import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  token: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    // Get the reset token from URL parameters
    this.token = this.route.snapshot.queryParams['token'];
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.resetPasswordForm.get('password')?.value === this.resetPasswordForm.get('confirmPassword')?.value) {
      const { password ,confirmPassword} = this.resetPasswordForm.value;
      this.authService.resetPassword(this.token!, password!,confirmPassword!).subscribe(
        (response) => {
          this.toastr.success('Password reset successful!', 'Success');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.log("errorrr",error);
        }
      );
    }
  }
}
