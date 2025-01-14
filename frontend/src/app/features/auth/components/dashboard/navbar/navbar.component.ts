// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  isModalOpen: boolean = false;
  isDropdownOpen = false;
  selectedFile: File | null = null;

  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    profileImage: 'assets/default-profile.jpg', // Fallback image
  };

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) {
      console.log('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);

    this.http.post('http://localhost:3000/api/v1/profile/upload-profile', formData).subscribe(
      (response: any) => {
        this.userProfile.profileImage = response.profilePicUrl;
        this.closeModal();
        console.log('Profile picture uploaded successfully');
      },
      (error) => {
        console.error('Error uploading profile picture', error);
      }
    );
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
        this.userProfile.username = data.username;
        this.userProfile.profileImage = data.profileImage || 'assets/default-profile.jpg';
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
}
