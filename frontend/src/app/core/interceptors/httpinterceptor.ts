import { AuthService } from 'src/app/core/services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {  Router } from '@angular/router';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
   constructor(private authService:AuthService,private router:Router){}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('authToken');
    console.log(token)
    // Clone the request to add the authorization header
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: token
        }
      });

      // Pass the cloned request instead of the original request to the next handler
     // return next.handle(clonedRequest);
    }

    // If no token, pass the request as is
    return next.handle(req).pipe(
      catchError((err)=>{
          console.log("Error: ", err);
           if(err.status===401)
           {
              return this.authService.refreshAccessToken().pipe(
                switchMap((accessToken:any)=>{
                  sessionStorage.setItem("authToken",accessToken.accessToken);
                  const clone=req.clone({
                    setHeaders: {
                      Authorization: accessToken.accessToken
                    }
                  });
                  return next.handle(clone);
                }),
                catchError((err)=>{
                    this.router.navigate(['/login']);
                    return throwError(()=>err);
                })
              )
           }
        return throwError(()=>err);
      }
    ));
  }
}
