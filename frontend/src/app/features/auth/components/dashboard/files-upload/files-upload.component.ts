import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.css']
})
export class FilesUploadComponent implements OnInit {
  isModalOpen: boolean = false;
  selectedFile: File | null = null;
  uploadedFiles: any[] = [];
  selectedFiles: string[] = [];
  selectedFileUrl:SafeUrl='';
  isPreviewOpen:boolean =false;
  previewSrc: string | ArrayBuffer | null = null; // For preview
  previewType: string = ''; // For file type (image, text, pdf)

  constructor(private http: HttpClient,private santize:DomSanitizer) { }

  ngOnInit(): void {
    this.fetchUploadedFiles();
  }

  // Fetch the uploaded files from the backend
  fetchUploadedFiles() {
    this.http.get<any>('http://localhost:3000/api/v1/upload/files').subscribe(
      (files: any) => {
        console.log('Fetched Files:', files);
        if (Array.isArray(files.files)) {
          this.uploadedFiles = files.files;
          console.log('Uploaded Files:', this.uploadedFiles);
        } else {
          console.error('Invalid response: Expected an array of files', files);
        }
      },
      (error) => {
        console.error('Error fetching uploaded files:', error);
      }
    );
  }

  // Open the modal for file selection
  openModal() {
    this.isModalOpen = true;
   
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
    this.isPreviewOpen=false;
  }

  // Handle file drag over event
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Allow the drop
    const dropzone = document.querySelector('.drag-drop-area')!;
    dropzone.classList.add('dragover');
  }

  // Handle file drag leave event
  onDragLeave(event: DragEvent) {
    const dropzone = document.querySelector('.drag-drop-area')!;
    dropzone.classList.remove('dragover');
  }

  // Handle file drop event
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      console.log('Dropped files:', files);
      this.selectedFile = files[0]; // If you want to select the first file
    }

    const dropzone = document.querySelector('.drag-drop-area')!;
    dropzone.classList.remove('dragover'); 
  }

  // Handle file change event
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Upload the file to the backend
  uploadFiles() {
    if (this.selectedFile) {
      const formData = new FormData();
      console.log(formData);
      formData.append('file', this.selectedFile);

      this.http.post('http://localhost:3000/api/v1/upload/upload', formData).subscribe(response => {
        this.fetchUploadedFiles(); // Refresh the file list after upload
        this.closeModal();
      });
    }
  }

  // Handle the selection of files for download
  toggleFileSelection(fileName: string) {
    const index = this.selectedFiles.indexOf(fileName);
    if (index === -1) {
      this.selectedFiles.push(fileName);
    } else {
      this.selectedFiles.splice(index, 1);
    }
  }

   // Show preview when a file is clicked
   previewFile(url: string) {
    this.isPreviewOpen=true;
    console.log(this.isPreviewOpen);
    this.previewType=this.getFileType(url);
    this.previewSrc=url;
    if(this.previewType==='xlsx')
    {
    const officeViewerBaseUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=';
    const officeUrl=`${officeViewerBaseUrl}${encodeURIComponent(url)}`;
    this.selectedFileUrl=this.santize.bypassSecurityTrustResourceUrl(officeUrl)
    console.log(this.selectedFileUrl);
    }
    else
    this.selectedFileUrl=this.santize.bypassSecurityTrustResourceUrl(url)
  }
/*
  getOfficeViewerUrl(fileUrl: string): void {
    // Ensure the file URL is publicly accessible
    const officeViewerBaseUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=';
    const officeUrl=`${officeViewerBaseUrl}${encodeURIComponent(fileUrl)}`;
    this.selectedFileUrl=this.santize.bypassSecurityTrustResourceUrl(officeUrl)
  }
*/
  // Determine the type of file (image, text, pdf)
  getFileType(fileType: string): string {
    const ext=fileType.split('.').pop()?.toLowerCase();
    if (ext==='jpg' || ext==='png' || ext==='jpeg') {
      return 'image';
    } else if (ext==='xlsx') {
      return 'xlsx';
    } else if (ext==='xls') {
      return 'xls';
    } else if (ext==='pdf') {
      return 'pdf';
    }
    return 'unknown';
  }
   downloadAll() {
      if (this.selectedFiles.length === 1) {
        // If only one file is selected, download it directly
        const selectedFileName = this.selectedFiles[0];
        this.http.post('http://localhost:3000/api/v1/upload/download', { fileNames: [selectedFileName] }, { responseType: 'blob' }).subscribe(blob => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = selectedFileName; // Download the single file with its name
          link.click(); // Trigger the download
        });
      } else if (this.selectedFiles.length > 1) {
        // If more than one file is selected, download them as a zip
        this.http.post('http://localhost:3000/api/v1/upload/download', { fileNames: this.selectedFiles }, { responseType: 'blob' }).subscribe(blob => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'files.zip'; // Specify the name of the downloaded zip file
          link.click(); // Trigger the download
        });
      } else {
        // If no files are selected, download all files
        const allFileNames = this.uploadedFiles.map(file => file.name);
        this.http.post('http://localhost:3000/api/v1/upload/download', { fileNames: allFileNames }, { responseType: 'blob' }).subscribe(blob => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'files.zip'; // Specify the name of the downloaded zip file
          link.click(); // Trigger the download
        });
      }
    }
    

  // Download individual file
  downloadFile(fileUrl: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop()!;
    link.click();
  }

}
