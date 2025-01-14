import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.css']
})
export class FilesUploadComponent implements OnInit {
  uploadedFiles = [
    { name: 'file1.txt' },
    { name: 'file2.csv' },
    { name: 'file3.pdf' },
  ];
  constructor() { }

  ngOnInit(): void {
  }
  downloadAll() {
    console.log('Downloading all files...');
    // Implement file download logic here
  }

  uploadFiles() {
    console.log('Uploading files...');
    // Implement file upload logic here
  }

}
