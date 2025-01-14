import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../../core/services/product.service';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css']
})
export class InventoryTableComponent implements OnInit {
  products: any[] = [];
  totalVendorsCount = 10;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }
   // Fetch products from the backend
   loadProducts(): void {
    this.productService.getProducts().subscribe(
      (data) => {
        this.products = data;
        console.log(data)
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  addProductSubmit(): void {
    console.log('Product added successfully');
    // Add your logic for handling the form submission here.
  }


  // Actions when buttons are clicked
  moveToCart() {
    console.log('Move to Cart');
  }

  downloadAll() {
    console.log('Download All');
  }

  importData() {
    console.log('Import Data');
  }

  addProduct() {
    console.log('Add Product');
  }

  viewAll() {
    console.log('View All');
  }

  viewCart() {
    console.log('View Cart');
  }

  searchQuery(event: any) {
    console.log('Search:', event.target.value);
  }

  openFilters() {
    console.log('Open Filters');
  }

  downloadProduct(product: any) {
    console.log('Download Product', product);
  }

  deleteProduct(product: any) {
    console.log('Delete Product', product);
  }

  editProduct(product: any) {
    console.log('Edit Product', product);
  }
}
