import { ProductService } from './../../../../../core/services/product.service';
// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
declare var bootstrap:any;
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profileImage: string;
  role:number;
  branch:number;
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
  selectedImage: string | null = null;
  showUsersTable:boolean=false;
  users: any[] = [];
  selectedUser: any = null;
  editMode = false;
  roles: any[] = [];


  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    profileImage: 'assets/default.jpg', // Fallback image
    role:0,
    branch:0,
  };

  roleMap: { [key: number]: string } = {
    1: 'Admin',
    2: 'Manager',
    3: 'User',
  };

  constructor(private router: Router, private authService: AuthService, private http: HttpClient,private productService:ProductService) {}

  ngOnInit(): void {
    this.fetchRoles();
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
      this.selectedImage = URL.createObjectURL(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    //event.stopPropagation();
  }
  
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    //event.stopPropagation();
  }
  
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
      this.selectedImage = URL.createObjectURL(this.selectedFile);
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) {
      //console.log("type of null: " + typeof this.selectedFile);
      console.log('No file selected');
      return;
    }

    const formData = new FormData();

    formData.append('profileImage', this.selectedFile, this.selectedFile.name);

    this.http.post('http://localhost:3000/api/v1/profile/upload-profile', formData).subscribe({
      next: (response: any) => {
        console.log('Profile picture uploaded successfully', response);
        this.userProfile.profileImage=response.profilePicUrl;
        //this.closeModal();
      },
      error: (error) => {
        console.error('Error uploading profile picture', error);
      },
    });
    this.closeModal();
  }

  toggleDropdown(): void {
    console.log("user role",this.userProfile.role)
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log("dropdown called",this.isDropdownOpen)
    // Check if the user is an admin (assuming role 1 is for admin)
  if (this.userProfile.role === 1) {
    console.log("Admin role detected. Dropdown opened.");
  } else {
    console.log("Non-admin role. Manage Users option won't be visible.");
  }
  }

  toggleDropClose():void{
    this.isDropdownOpen=false;
  }

  toggleUsersTable(): void {
    if (!this.showUsersTable) {
      this.fetchUsers();
    }
    this.showUsersTable = !this.showUsersTable;
  }
  editUser(user: any): void {
    this.selectedUser = { ...user };
    this.editMode = true;
    // Open the modal using Bootstrap's API
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
  }
  saveUser(): void {
    this.productService.updateUser(this.selectedUser.user_id, this.selectedUser).subscribe(
      () => {
        this.fetchUsers();
        //this.editMode = false;
        this.closeEditModal(); 
      },
      (error) => console.error('Error updating user:', error)
    );
  }
  closeEditModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    modal.hide();
  }
  fetchUsers(): void {
    this.productService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => console.error('Error fetching users:', error)
    );
  }
  fetchRoles() {
    this.productService.getRoles().subscribe(
      data => this.roles = data,
      error => console.error('Error fetching roles:', error)
    );
  }
  getRoleName(roleId: number): string {
    return this.roleMap[roleId] || 'Unknown'; // Default if role is missing
  }
    getRoleClass(roleId: number): string {
      const roleClasses: { [key: number]: string } = {
        1: 'role-admin',
        2: 'role-manager',
        3: 'role-user',
      };
      return roleClasses[roleId] || 'role-default';
    }

  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (data) => {
        sessionStorage.setItem('user_id',data.user_id);
        this.userProfile.firstName = data.firstName;
        this.userProfile.lastName = data.lastName;
        this.userProfile.email = data.email;
        this.userProfile.username = data.username;
        this.userProfile.profileImage = data.profileImage || 'assets/default.jpg';
        this.userProfile.role=data.role;
        this.userProfile.branch=data.branch;
        this.authService.setUser(data.user_id);
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

  chat(){
    this.router.navigateByUrl('/navbar/chat');
  }
}