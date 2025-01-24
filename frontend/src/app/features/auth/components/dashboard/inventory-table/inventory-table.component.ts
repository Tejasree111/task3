import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../../core/services/product.service';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Product {
  id: number;
  product_name: string;
  category_name: string;
  product_image?: string;
  quantity_in_stock: number;
  unit_price: number;
  status: string;
  //vendors:vendor[];
  vendors: string[];
  isSelected?: boolean;
  isEditing?:boolean;
}

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css'],
})
export class InventoryTableComponent implements OnInit {
  vendors:any[]=[];
  products: {
    id: number;
    product_name: string;
    category_name: string;
    product_image?: string;
    quantity_in_stock: number;
    unit_price: number;
    status: string;
    vendors: string[];
    isSelected?: boolean;
    isEditing?:boolean;
  }[] = [];
  isDragging: boolean = false;
  files: File[] = [];
  cartProducts: any[] = [];
  totalVendorsCount :number =0;
  totalPages: number = 0;
  currentPage: number = 1;
  limit: number = 10;
  addProductForm: FormGroup;
  //vendors and categories
  //vendors: any[] = [];
  selectedVendors: { [key: string]: boolean } = {};
  categories: any[] = [];
  selectedImage: string | null = null;
  selectedVendorId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedFile: File | null = null;
  isCartView: boolean = true;
  //selectedProducts: any|any[];
  selectedProducts:Product[]=[];
  dropdownVisible: boolean = false;
  
  

  // Columns filter state
  columnsFilter = {
    product: false,
    category: false, // Whether to filter by category
    vendor: false, // Whether to filter by vendor
  };

  selectedCategory: string = '';
  selectedVendor: string = '';
  selectedStatus: string = '';
  searchTerm: string = '';

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
      status: ['', [Validators.required]], // default to active
      productImage: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadVendorsAndCategories();
    this.loadCartFromSession();
    //this.clearCartOnPageLoad();
    this.resetModalSelections();
  }

  

 resetModalSelections(): void {
  this.selectedProducts = []; // Reset the selected products for the modal
  
}
  // Toggle visibility of the dropdown menu
  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  // Load products into the cart from session storage
  loadCartFromSession(): void {
    const cart = sessionStorage.getItem('cart');
    if (cart) {
      this.cartProducts = JSON.parse(cart);
    }
  }
  moveToCartModal(): void {
    this.selectedProducts = this.products.filter((product) => product.isSelected);
    console.log("Selected Products for Modal:", this.selectedProducts);
    
  }

  // Move selected products from the modal to the cart
  moveToCart(): void {
    this.selectedProducts.forEach((product: any) => {
      // Check if the product is already in the cart
      const existingProduct = this.cartProducts.find(
        (item) => item.product_id === product.product_id
      );
console.log("existing products:",existingProduct)
      if (existingProduct) {
        // Increase quantity if the product is already in the cart
        existingProduct.quantity += 1;
      } else {
        // Add the product to the cart if not already present
        this.cartProducts.push({
          ...product,
          quantity: 1,
        });
      }
    });
    this.updateCartInSession();
    this.loadCartFromSession();
    this.resetModalSelections(); // Clear the modal selections after moving to cart
  }
  //modal related
increaseQuantityModal(index: number): void {
  this.selectedProducts[index].quantity_in_stock += 1;
}

decreaseQuantityModal(index: number): void {
  if (this.selectedProducts[index].quantity_in_stock > 1) {
    this.selectedProducts[index].quantity_in_stock -= 1;
  }
}

removeFromCartModal(index: number): void {
  this.selectedProducts.splice(index, 1);
}

//cart table related
increaseQuantity(index: number): void {
  this.cartProducts[index].quantity += 1;
  this.updateCartInSession();
}

decreaseQuantity(index: number): void {
  if (this.cartProducts[index].quantity > 1) {
    this.cartProducts[index].quantity -= 1;
    this.updateCartInSession();
  }
}
removeFromCart(index: number): void {
  const productToDelete = this.cartProducts[index];
  
  // Remove product from the cart
  this.cartProducts.splice(index, 1);
  // Remove product from the original products array (if needed)
  const productIndex = this.products.findIndex(
    (product) => product.id === productToDelete.id
  );
  if (productIndex !== -1) {
    this.products.splice(productIndex, 1);
  }

  this.updateCartInSession();  // Update session storage with the new cart
}

  updateCartInSession(): void {
    sessionStorage.setItem('cart', JSON.stringify(this.cartProducts));
  }

  checkout(): void {
    console.log(
      'Proceed to checkout with the following cart:',
      this.cartProducts
    );
  }

  toggleCartView() {
    this.isCartView = !this.isCartView;
  }

  loadVendorsAndCategories(): void {
    this.http
      .get<any>('http://localhost:3000/api/v1/products/vendors-and-categories')
      .subscribe({
        next: (data) => {
          this.vendors = data.vendors;
          this.categories = data.categories;
          console.log(this.vendors)
          console.log("categories",this.categories);
          this.totalVendorsCount = this.vendors.length;
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

    onImageSelect(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.selectedImage = reader.result as string;  
        };
        reader.readAsDataURL(file);
      }
    }

  addProducts() {
    if (!this.addProductForm.valid) return;

    const productData = this.addProductForm.value;
    const formData = new FormData();

    if (this.selectedFile) {
      formData.append(
        'productImage',
        this.selectedFile,
        this.selectedFile.name
      );
      this.http
        .post('http://localhost:3000/api/v1/profile/upload-product', formData)
        .subscribe({
          next: (response: any) => {
            this.selectedImage = response.thumbnailUrl;
            console.log(response.productPicUrl);
            this.saveProduct(productData, response.productPicUrl);
          },
          error: (error) => console.error('Error uploading image', error),
        });
    } else {
      this.saveProduct(productData, null);
    }
  }

  saveProduct(productData: any, imageUrl: string | null) {
    this.productService.addProduct(productData, imageUrl).subscribe({
      next: (response) => {
        console.log(imageUrl);
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
    formData.append('file', file, file.name);
  });

  // Convert the selected Excel file into JSON before sending it to the server
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const workbook = XLSX.read(e.target.result, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];  
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(jsonData);

    // Send the JSON data to the backend
    this.http.post('http://localhost:3000/api/v1/files/import', jsonData).subscribe({
      next: (response: any) => {
        this.toastr.success('Files uploaded and data imported successfully.');
        this.loadProducts();  // Refresh the product list
      },
      error: (error) => {
        console.error('Error uploading files', error);
        this.toastr.error('Failed to upload files.');
      }
    });
  };
  reader.readAsBinaryString(this.files[0]);  // Read the first file
}

  importData(): void {
    this.uploadFiles();
  }
/*
loadProducts(): void {
  this.productService.getProducts(this.currentPage, this.limit).subscribe({
    next: (data) => {

      //const products = sessionStorage.getItem('products');
    
      let filteredProducts: Product[] = data.products;

      // Ensure 'vendors' is always an array of strings (in case it's returned as a single string)
      filteredProducts = filteredProducts.map(product => {
        if (typeof product.vendors === 'string') {
          product.vendors = [product.vendors];  // Convert single string to array
        }
        return product;
      });

      this.totalPages = data.totalPages;

      // Apply search filtering
      if (this.searchTerm) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.product_name.toLowerCase().includes(this.searchTerm) ||
            product.category_name.toLowerCase().includes(this.searchTerm) ||
            product.vendors.some((vendor: string) => vendor.toLowerCase().includes(this.searchTerm)) // Explicitly type vendor as string
        );
      }

      // Apply category filter
      if (this.selectedCategory) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category_name === this.selectedCategory
        );
      }

      // Apply vendor filter
      if (this.selectedVendor) {
        filteredProducts = filteredProducts.filter(
          (product) => product.vendors.includes(this.selectedVendor)  // vendors is an array now
        );
      }

      // Apply status filter
      if (this.selectedStatus !== '') {
        filteredProducts = filteredProducts.filter(
          (product) => product.status === this.selectedStatus
        );
      }

      this.products = filteredProducts;
    },
    error: (error) => {
      console.error('Error fetching products:', error);
    },
  });
}*/

loadProducts(): void {
  this.productService.getProducts(this.currentPage, this.limit, this.searchTerm).subscribe({
    next: (data) => {
      let filteredProducts: Product[] = data.products;

      // Ensure 'vendors' is always an array of strings (in case it's returned as a single string)
      filteredProducts = filteredProducts.map(product => {
        if (typeof product.vendors === 'string') {
          product.vendors = [product.vendors];  // Convert single string to array
        }
        return product;
      });

      this.totalPages = data.totalPages;

      // Apply category filter
      if (this.selectedCategory) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category_name === this.selectedCategory
        );
      }

      // Apply vendor filter
      if (this.selectedVendor) {
        filteredProducts = filteredProducts.filter(
          (product) => product.vendors.includes(this.selectedVendor)  // vendors is an array now
        );
      }

      // Apply status filter
      if (this.selectedStatus !== '') {
        filteredProducts = filteredProducts.filter(
          (product) => product.status === this.selectedStatus
        );
      }

      this.products = filteredProducts;
    },
    error: (error) => {
      console.error('Error fetching products:', error);
    },
  });
}
  searchQuery(event: any) {

    this.searchTerm = event.target.value.toLowerCase();
    this.loadProducts();
  }
  applyFilters(): void {
    this.loadProducts(); // Re-load products with the filters applied
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

  goToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
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


  getVendorClass(vendor: string): string {
    const vendorClasses = ['vendor-btn-purple', 'vendor-btn-blue', 'vendor-btn-green', 'vendor-btn-orange'];
    const index = this.vendors.indexOf(vendor);
    return vendorClasses[index % vendorClasses.length];
  }

  // Select/Deselect all checkboxes
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.products.forEach((product) => {
      product.isSelected = isChecked;
    });
  }

  getPages(): number[] {
    let pages = [];
    // Loop from 1 to totalPages to create page buttons dynamically
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Check if all products are selected
  isAllSelected(): boolean {
    return this.products.every((product) => product.isSelected);
  }

  addProduct() {
    console.log('Add Product');
  }

  viewAll() {
    console.log('View All');
    this.isCartView = true; 
  }

  viewCart() {
    console.log('View Cart');
    this.isCartView = false;
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
      product.isEditing = true;
      product.editedProduct = { ...product };  // Save the original state of the product before editing
    }
    
    cancelEdit(product: any) {
      Object.assign(product, product.editedProduct);
      product.isEditing = false;
      console.log("cancel triggered")
      // Restore the original product state
      
    }
    
    savesProduct(product: any) {
      // Update product via the service and save changes
      this.productService.updateProduct(product).subscribe(
        (response) => {
          product.isEditing = false;
          this.toastr.success('Product updated successfully');
        },
        (error) => {
          this.toastr.error('Failed to update product');
        }
      );
    }
    
}
