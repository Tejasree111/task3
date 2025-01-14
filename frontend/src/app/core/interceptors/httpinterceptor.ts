import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from storage or wherever you store it
    const token = sessionStorage.getItem('authToken'); // Or use your preferred method

    // Clone the request to add the authorization header
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: token
        }
      });

      // Pass the cloned request instead of the original request to the next handler
      return next.handle(clonedRequest);
    }

    // If no token, pass the request as is
    return next.handle(req);
  }
}
