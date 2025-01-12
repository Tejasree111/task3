import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service'; // Ensure correct path

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profileImage: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isDropdownOpen = false;
  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    profileImage: '' // Fallback/default image
  };

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe(
        (data) => {
            this.userProfile.firstName = data.firstName;
            this.userProfile.lastName = data.lastName;
            this.userProfile.email = data.email;
            this.userProfile.username=data.username;
            this.userProfile.profileImage = ' '; // Default image
        },
        (error) => {
            console.error('Error fetching user profile:', error);
        }
    );
}


  logout(): void {
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  updateProfilePicture(): void {
    console.log('Update profile picture clicked');
  }
}
