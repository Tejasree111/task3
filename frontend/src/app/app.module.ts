import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule ,HTTP_INTERCEPTORS} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SignUpComponent } from './features/auth/components/sign-up/sign-up.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './features/auth/components/dashboard/navbar/navbar.component';
import { HttpInterceptorService } from './core/interceptors/httpinterceptor';
import { InventoryTableComponent } from './features/auth/components/dashboard/inventory-table/inventory-table.component';
import { FilesUploadComponent } from './features/auth/components/dashboard/files-upload/files-upload.component';
import { EncryptionInterceptor } from './core/interceptors/encryption.interceptor';
import { NgxPaginationModule } from 'ngx-pagination';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { ChatComponent } from './features/auth/components/dashboard/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    SignUpComponent,
    LoginComponent,
    NavbarComponent,
    InventoryTableComponent,
    FilesUploadComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ChatComponent,
  ],
  imports: [
    NgxPaginationModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',   // Position of the toastr
      timeOut: 2000,                        // Duration for the toast to be displayed
      closeButton: true,                 // Optionally show a close button
      progressBar: true,                 // Show progress bar
      preventDuplicates: true,           // Prevent duplicate toastrs
      newestOnTop: true               
    }), 
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass:HttpInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EncryptionInterceptor,
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
