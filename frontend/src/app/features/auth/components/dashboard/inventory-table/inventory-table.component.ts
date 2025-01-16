import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../../core/services/product.service';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css'],
})
export class InventoryTableComponent implements OnInit {
  products: {
    id: number;
    product_name: string;
    category_name: string;
    product_image?: string;
    quantity_in_stock: number;
    unit_price: number;
    status: string;
    vendors: string;
    isSelected?: boolean;
  }[] = [];
  isDragging: boolean = false;
  files: File[] = [];
  //products: any[] = [];
  totalVendorsCount = 3;
  totalPages: number = 0;
  currentPage: number = 1;
  limit: number = 10;
  addProductForm: FormGroup;
  //vendors and categories
  vendors: any[] = [];
  categories: any[] = [];
  selectedImage: string | null = null;
  selectedVendorId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedFile: File | null = null;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.addProductForm = this.fb.group({
      productName: ['', [Validators.required]],
      category: ['', [Validators.required]],
      vendor: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required]],
      status: ['1', [Validators.required]], // default to active
      productImage: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadVendorsAndCategories();
  }
  loadVendorsAndCategories(): void {
    this.http
      .get<any>('http://localhost:3000/api/v1/products/vendors-and-categories')
      .subscribe({
        next: (data) => {
          this.vendors = data.vendors;
          this.categories = data.categories;
          console.log(this.categories);
        },
        error: (error) => {
          console.error('Error fetching vendors and categories:', error);
        },
      });
  }

  productToDelete: any = null;

  setProductToDelete(product: any): void {
    this.productToDelete = product;
  }
  confirmDelete(): void {
    if (this.productToDelete) {
      const updatedProduct = { ...this.productToDelete, status: 99 };

      this.productService.updateProductStatus(updatedProduct).subscribe({
        next: () => {
          this.toastr.success('Product deleted successfully!');
          this.loadProducts(); // Refresh the product list to reflect the soft delete
          this.productToDelete = null; // Clear the selected product
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.toastr.error('Failed to delete product.');
        },
      });
    }
  }
  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  addProducts() {
    if (this.addProductForm.valid) {
      const productData = this.addProductForm.value;

      if (this.addProductForm.value.productImage != null) {
        const formData = new FormData();
        if (this.selectedFile)
          formData.append(
            'productImage',
            this.selectedFile,
            this.selectedFile.name
          );
        this.http
          .post('http://localhost:3000/api/v1/profile/upload-product', formData)
          .subscribe({
            next: (response: any) => {
              console.log('Profile picture uploaded successfully', response);
              //this.userProfile = response;
              this.selectedImage = response.thumbnailUrl;
              this.productService
                .addProduct(productData, this.selectedImage)
                .subscribe({
                  next: (response) => {
                    console.log('Product added successfully', response);
                    this.toastr.success('Product added successfully!');
                    this.loadProducts(); // Refresh the product list
                  },
                  error: (error) => {
                    console.error('Error adding product', error);
                    this.toastr.error('Failed to add product');
                  },
                });
            },
            error: (error) => {
              console.error('Error uploading profile picture', error);
            },
          });
      } else {
        this.productService.addProduct(productData, null).subscribe({
          next: (response) => {
            console.log('Product added successfully', response);
            this.toastr.success('Product added successfully!');
            this.loadProducts(); // Refresh the product list
          },
          error: (error) => {
            console.error('Error adding product', error);
            this.toastr.error('Failed to add product');
          },
        });
      }
      // Call your service to save the product
      console.log(productData);
    }
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        this.files.push(event.dataTransfer.files[i]);
      }
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        this.files.push(target.files[i]);
      }
    }
  }

  uploadFiles(): void {
    if (this.files.length === 0) {
      this.toastr.error('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    this.files.forEach((file) => {
      formData.append('file', file, file.name); // Append the file(s)
    });

    this.http.post('http://localhost:3000/api/v1/import', formData).subscribe({
      next: (response: any) => {
        this.toastr.success('Files uploaded and data imported successfully.');
        this.loadProducts(); // Refresh the product list
      },
      error: (error) => {
        console.error('Error uploading files', error);
        this.toastr.error('Failed to upload files.');
      },
    });
  }

  importData(): void {
    this.uploadFiles();
  }

  loadProducts(): void {
    this.productService.getProducts(this.currentPage, this.limit).subscribe({
      next: (data) => {
        this.products = data.products;
        console.log(data);
        this.totalPages = data.totalPages;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      },
    });
  }
 
  // Download selected products
  downloadSelected(): void {
    // Filter selected records
    const selectedProducts = this.products.filter(
      (product) => product.isSelected
    );

    if (selectedProducts.length === 0) {
      this.toastr.warning('Select a record to download', 'No Records Selected');
      return;
    }

    // Prepare data for Excel
    const worksheetData = selectedProducts.map((product) => ({
      'Product Name': product.product_name,
      Category: product.category_name,
      Vendors: product.vendors,
      Quantity: product.quantity_in_stock,
      'Unit Price': product.unit_price,
      Status: product.status === '1' ? 'Active' : 'Inactive',
    }));

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Products');

    // Export to Excel
    XLSX.writeFile(workbook, 'Selected_Products.xlsx');
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }



  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  getDisplayedPages(): number[] {
    const range: number[] = [];
    const rangeSize = 10; // Number of pages to display around the current page
    const start = Math.max(this.currentPage - rangeSize, 1);
    const end = Math.min(this.currentPage + rangeSize, this.totalPages);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }

  // Select/Deselect all checkboxes
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.products.forEach((product) => {
      product.isSelected = isChecked;
    });
  }

  // Check if all products are selected
  isAllSelected(): boolean {
    return this.products.every((product) => product.isSelected);
  }

  // Actions when buttons are clicked
  moveToCart() {
    console.log('Move to Cart');
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

  downloadProduct(product: any): void {
    // Initialize jsPDF instance
    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);

    // Add a title
    doc.text('Product Details', 105, 10, { align: 'center' });

    // Add product details
    doc.setFontSize(12);
    doc.text(`Product Name: ${product.product_name}`, 10, 30);
    doc.text(`Category: ${product.category_name}`, 10, 40);
    doc.text(`Vendors: ${product.vendors}`, 10, 50);
    doc.text(`Quantity in Stock: ${product.quantity_in_stock}`, 10, 60);
    doc.text(`Unit Price: ${product.unit_price}`, 10, 70);
    doc.text(
      `Status: ${product.status === '1' ? 'Active' : 'Inactive'}`,
      10,
      80
    );

    // Add a footer
    doc.setFontSize(10);
    doc.text('Generated by Inventory App', 10, 290);

    // Save the PDF with the product name
    const filename = `${product.product_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }

  editProduct(product: any) {
    console.log('Edit Product', product);
  }
}
