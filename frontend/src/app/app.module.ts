import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule ,HTTP_INTERCEPTORS} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SignUpComponent } from './features/auth/components/sign-up/sign-up.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './features/auth/components/dashboard/navbar/navbar.component';
import { HttpInterceptorService } from './core/interceptors/httpinterceptor';

@NgModule({
  declarations: [
    AppComponent,
    SignUpComponent,
    LoginComponent,
    NavbarComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',   // Position of the toastr
      timeOut: 5000,                        // Duration for the toast to be displayed
      closeButton: true,                 // Optionally show a close button
      progressBar: true,                 // Show progress bar
      preventDuplicates: true,           // Prevent duplicate toastrs
      newestOnTop: true               
    }), 
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true // This ensures multiple interceptors can be used
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
