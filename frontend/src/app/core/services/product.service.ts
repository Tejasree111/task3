import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,catchError ,throwError} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient,private toastr:ToastrService) {}

    getProducts(page: number, limit: number,searchTerm:string): Observable<any> {
      return this.http.get<any>(
        `${this.apiUrl}/products?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
      ) .pipe(
        catchError((error: any) => {
          if (error.status === 429) {
            // Display Toastr notification for rate-limiting error
            this.toastr.error(
              'Too many requests, please try again later.', // Message
              'Rate Limit Exceeded',                      // Title
              {
                timeOut: 5000, // 5 seconds timeout
                progressBar: true, // Show a progress bar
                closeButton: true, // Show a close button
              }
            );
          }
          // Re-throw the error so it can be handled further if necessary
          return throwError(() => error);
        })
      );
    }

    addProduct(productData: any,selectedImage:string | null): Observable<any> {
     const product={productData,selectedImage};
      return this.http.post<any>(`${this.apiUrl}/products/add`, product );
    }

    updateProduct(product: any): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/products/${product.product_id}`, product);
    }

    updateProductStatus(product: any): Observable<any> {
      console.log("Product: ", product);
      return this.http.put(`http://localhost:3000/api/v1/products/${product.product_id}/status`, { status: product.status });
    }
    
}
