import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.css']
})
export class FilesUploadComponent implements OnInit {
  isModalOpen: boolean = false;
  selectedFile : File | null = null;
  uploadedFiles = [
    { name: 'file1.txt' },
    { name: 'file2.csv' },
    { name: 'file3.pdf' },
  ];

  constructor() { }

  ngOnInit(): void { }

  // Open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Handle file drag over event
  onDragOver(event: DragEvent) {
    event.preventDefault();
    const dropzone = document.querySelector('.dropzone')!;
    dropzone.classList.add('dragover');
  }

  // Handle file drag leave event
  onDragLeave(event: DragEvent) {
    const dropzone = document.querySelector('.dropzone')!;
    dropzone.classList.remove('dragover');
  }

  // Handle file drop event
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      // Handle the dropped files here (you can upload them or show them)
      console.log('Dropped files:', files);
    }

    const dropzone = document.querySelector('.dropzone')!;
    dropzone.classList.remove('dragover');
  }

  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Handle file upload
  uploadFiles() {
    console.log('Uploading files...');
    // Implement file upload logic here
    this.closeModal();
  }

  // Handle downloading all files
  downloadAll() {
    console.log('Downloading all files...');
    // Implement file download logic here
  }
}
