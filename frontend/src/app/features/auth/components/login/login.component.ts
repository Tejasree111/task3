import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder,Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm : FormGroup;
  constructor(private fb:FormBuilder, private authService: AuthService, private router: Router,private toastr: ToastrService) { 
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        (response: any) => {
          console.log('Login successful, response:', response);
          
          if (response?.accessToken) {
            sessionStorage.setItem('authToken', response.accessToken.accessToken);
            this.toastr.success("You're signed in successfully!", 'Success');
            this.router.navigate(['/navbar']).catch((err) =>
              console.error('Navigation error:', err)
            );
          } else {
            this.toastr.error('Login failed, no access token received.', 'Error');
          }
        },
        (error: any) => {
          console.error('Login failed', error);
          this.toastr.error('Login failed, please try again.', 'Error');
        }
      );
    }
  }
  
}


/*
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any; // Bootstrap modal
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) { 
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Forgot Password Form
    this.forgotPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        (response: any) => {
          console.log('Login successful, response:', response);
          
          if (response?.accessToken) {
            sessionStorage.setItem('authToken', response.accessToken.accessToken);
            this.toastr.success("You're signed in successfully!", 'Success');
            this.router.navigate(['/navbar']).catch((err) =>
              console.error('Navigation error:', err)
            );
          } else {
            this.toastr.error('Login failed, no access token received.', 'Error');
          }
        },
        (error: any) => {
          console.error('Login failed', error);
          this.toastr.error('Login failed, please try again.', 'Error');
        }
      );
    }
  }

  onSubmitPasswordReset(): void {
    if (this.forgotPasswordForm.valid) {
      const { newPassword, confirmPassword } = this.forgotPasswordForm.value;

      if (newPassword === confirmPassword) {
        this.authService.resetPassword(newPassword).subscribe(
          (response:any) => {
            alert('Password reset successful');
            // Optionally close the modal here if you want
            const modal = document.getElementById('forgotPasswordModal');
            if (modal) {
              const bsModal = new bootstrap.Modal(modal);
              bsModal.hide();
            }
          },
          (error:any) => {
            alert('Error resetting password');
          }
        );
      } else {
        alert('Passwords do not match');
      }
    }
  }
}
*/