import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';
  private tokenKey = 'authToken';  // Key for session storage
  private refreshTokenKey = 'refreshToken';
  private user_id='';

  constructor(
    private http: HttpClient, 
    private toastr: ToastrService, 
    private router: Router
  ) {}

  // Login function
login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }
  // Signup function
signup(user: { username: string; email: string; password: string; first_name: string; last_name: string }): Observable<any> {
  console.log(user);  
  return this.http.post<any>(`${this.apiUrl}/signup`, user);
  }


  setUser(user_id:any){
  this.user_id=user_id;
  }
// Get user info from the backend
getUserProfile(): Observable<any> {
  const token = sessionStorage.getItem(this.tokenKey);
  if (!token) {
      this.router.navigate(['/login']);
      return new Observable(); // Empty observable
  }

  return this.http.get<any>(`${this.apiUrl}/profile`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  });
}

  // Save both access and refresh tokens
  saveTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(this.tokenKey, accessToken);
    sessionStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  // Get refresh token from sessionStorage
  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  // Refresh access token using refresh token
  refreshAccessToken(): Observable<any> {
    const user_id=sessionStorage.getItem('user_id');

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { user_id });
  }

  // Check if the access token has expired, and if so, refresh it
  /*
  checkAndRefreshToken(): Observable<any> {
    const token = this.getToken();
    if (this.isTokenExpired(token)) {
      return this.refreshAccessToken();
    }
    return new Observable();
  }*/

  // Helper method to check if a token has expired 
  /*
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    const decoded = this.decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }*/

  // Decode token
  decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  // Get token from session storage
  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  // Manually decode the token and extract the payload
  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        const payload = token.split('.')[1]; // Extract JWT payload
        return JSON.parse(atob(payload)); // Decode base64 and parse JSON
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  // Get user info from the decoded token
  getUserInfoFromToken(): any {
    const decodedToken = this.getDecodedToken();
    if (decodedToken) {
      // Return the decoded token directly as it contains user info
      return {
        id: decodedToken.id,
        username: decodedToken.username,
        email: decodedToken.email
      };
    }
    console.warn('Decoded token is null or invalid');
    return null;
  }
   // Logout function
   logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.toastr.info('You have been logged out.', 'Logout');
    this.router.navigate(['/login']);
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();  // If token exists, the user is authenticated
  }

 sendResetPasswordLink(email: string) {
  return this.http.post(`${this.apiUrl}/forgot-password`, { email });
}

resetPassword(token: string, newPassword: string ,confirmPassword:string) {
  return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword,confirmPassword });
}
}
