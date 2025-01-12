import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router,private toastr: ToastrService) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8),Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.signupForm.valid) {
      const { firstName, lastName, email, password } = this.signupForm.value;
  
      // Generate a random number for uniqueness
      const randomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  
      // Construct the username using firstName, lastName, and random number
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNumber}`;
  
      const formData = {
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
      };
  
      console.log('Form Submitted with:', formData);
  
      // Submit the form
      this.authService.signup(formData).subscribe(
        (response: any) => {
          console.log('Signup successful', response);
          this.toastr.success("You've Registered successfully!", 'Success');
          this.router.navigate(['/login']);
        },
        (error: any) => {
          this.toastr.error("Registration failed. Please try again.", 'Registration Failed');  // Error toastr
          console.error('Signup error', error);
        }
      );
    } else {
      this.toastr.warning('Please fill in all fields correctly.', 'Validation Error');
      console.log('Form is invalid');
    }
  }
  
  

  /*onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Form Submitted:', this.signupForm.value);
      this.authService.signup(this.signupForm.value).subscribe(
        (response: any) => {
          console.log('Signup successful', response);
        },
        (error: any) => {
          console.error('Signup error', error);
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }*/
}
