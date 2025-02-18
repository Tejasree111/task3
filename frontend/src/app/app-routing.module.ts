import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { SignUpComponent } from './features/auth/components/sign-up/sign-up.component';
import { NavbarComponent } from './features/auth/components/dashboard/navbar/navbar.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ChatComponent } from './features/auth/components/dashboard/chat/chat.component';


const routes: Routes = [
  {path:'',component:SignUpComponent},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignUpComponent},
  {path:'navbar/chat',component:ChatComponent},
  {
    path: 'navbar',
    component: NavbarComponent,
    canActivate: [AuthGuard],  // Apply the AuthGuard to the dashboard route
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
