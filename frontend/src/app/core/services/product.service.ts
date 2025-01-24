import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

    getProducts(page: number, limit: number,searchTerm:string): Observable<any> {
      return this.http.get<any>(
        `${this.apiUrl}/products?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
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
