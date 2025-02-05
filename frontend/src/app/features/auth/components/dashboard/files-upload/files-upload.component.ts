import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { io } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
interface Upload {
  file_name: string;
  status: string;
  error_file_path: string;
  file_path: string; // Added file_path
}
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profileImage: string;
}

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.css'],
})
export class FilesUploadComponent implements OnInit {
  socket: any; 
  isChatOpen: boolean = false;
  chatMessages: string[] = [];
  currentMessage: string = '';
  userId: string = sessionStorage.getItem("user_id") || "";
  room: string = 'defaultRoom'; // Default room for group chat
  isInRoom = false;
  roomUsers: string[] = [];


  isModalOpen: boolean = false;
  selectedFile: File | null = null;
  isErrorModalOpen: boolean = false; // To control the error modal visibility
  errorFiles: any[] = []; // Store error files
  uploadedFiles: any[] = [];
  file: any[] = [];
  selectedFiles: string[] = [];
  selectedFileUrl: SafeUrl = '';
  isPreviewOpen: boolean = false;
  previewSrc: string | ArrayBuffer | null = null; // For preview
  previewType: string = ''; // For file type (image, text, pdf)
  isCartView = true;
  currentPage:number = 1;
  totalPages:number = 1;
  uploads: Upload[] = [];

  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    profileImage: 'assets/default.jpg', // Fallback image
  };
  
  constructor(private http: HttpClient, private santize: DomSanitizer,private toastr: ToastrService, private authService:AuthService) {}

  ngOnInit(): void {
    this.fetchUserProfile();  

   // const userId:string= sessionStorage.getItem('user_id') || '';
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to the server',this.socket.id);
      if (this.userId) {
        console.log('Registering user with socket:',this.userId);
        this.socket.emit('register', this.userId);
      }
    });

    // Listen for room updates
    this.socket.on("roomUpdate", (users: string[]) => {
      this.roomUsers = users;
    });

    // Handle errors
    this.socket.on("error", (msg: string) => {
      this.toastr.error(msg);
    });

    // Register user with socket
    /*
    if (userId) {
      console.log('Registering user with socket:',userId);
      this.socket.emit('register', userId);
    }*/

    //this.socket.emit('joinRoom', this.room);

/*
    // Listen for file processing updates
    this.socket.on('fileStatusUpdate', (data: any) => {
      console.log('Received file status update:', data);
      const fileIndex = this.uploads.findIndex((f) => f.file_name === data.fileName);
      console.log("uploads :",this.uploads);
      console.log('File index:', fileIndex);
      console.log('File:', this.uploads[fileIndex]);
      if (fileIndex > -1) {
        this.uploads[fileIndex].status = data.status;
        if (data.status === 'processed') {
          console.log(`File ${data.fileName} processed successfully.`);
          console.log('File processed successfully:', data.fileName);
          alert(`File ${data.fileName} processed successfully.`);
        }
        if (data.status === 'failed') {
          console.log('File failed:', data.fileName);
          this.uploads[fileIndex].error_file_path = data.errorFilePath;
          alert(`File ${data.fileName} failed. Download error file.`);
        }
      }
    });*/
///this is workinggggg
    this.socket.on('fileStatusUpdate', (data: any) => {
      console.log('Received file status update:', data);
      if (data.status === 'processed') {
        console.log(`File ${data.fileName} processed successfully.`);
        this.toastr.success(`File ${data.fileName} processed successfully.`);
      } else if (data.status === 'failed') {
        console.log(`File ${data.fileName} failed.`);
       this.toastr.error(`File ${data.fileName} failed.`);
      }
    });
     // Listen for incoming group messages
     this.socket.on('groupMessage', (data: any) => {
      console.log('Received group message:', data);
      this.chatMessages.push(`${data.senderId}: ${data.message}`)
    });

    // Listen for private messages
    /*
    this.socket.on('privateMessage', (data: any) => {
      this.chatMessages.push(`${data.senderId}: ${data.message}`);
    });
   */

    // Acknowledge message delivery
    /*
    this.socket.on('messageDelivered', (data: any) => {
      console.log(`Message ${data.messageId} delivered`);
    });*/

    this.fetchUploadedFiles();
    const openModalButton = document.getElementById('openModalButton');
    if (openModalButton) {
      openModalButton.addEventListener('click', async () => {
        await this.fetchUploads(this.currentPage);
        const uploadModal = document.getElementById('uploadModal');
        if (uploadModal) {
          uploadModal.style.display = 'block';
        }
      });
    }

    const closeModalButton = document.querySelector('.btn-close');
    if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
        const uploadModal = document.getElementById('uploadModal');
        if (uploadModal) {
          uploadModal.style.display = 'none';
        }
      });
    }
  }

  // Toggle chat popup visibility
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  
  }

  // Create or Join a Room
  joinRoom() {
    if (this.room.trim()) {
      this.socket.emit("joinRoom", { userId: this.userId, room: this.room });
      this.isInRoom = true;
      this.toastr.success(`Joined room: ${this.room}`);
    } else {
      this.toastr.warning("Please enter a room name.");
    }
  }

  // Leave Room
  leaveRoom() {
    if (this.room.trim()) {
      this.socket.emit("leaveRoom", { userId: this.userId, room: this.room });
      this.isInRoom = false;
      this.chatMessages = [];
      this.toastr.info(`Left room: ${this.room}`);
    }
  }

  // Send a Group Message
  sendGroupMessage() {
    if (!this.isInRoom) {
      this.toastr.warning("You must join a room first!");
      return;
    }

    if (this.currentMessage.trim()) {
      this.socket.emit("groupMessage", { room: this.room, senderId: this.userId, message: this.currentMessage });
      this.chatMessages.push(`You: ${this.currentMessage}`);
      //this.currentMessage = "";
    }
  }

/*
  // Send a group message
  sendGroupMessage() {
    if (this.currentMessage.trim()) {
      const messageId = Date.now(); // Use timestamp as message ID
      this.socket.emit('groupMessage', { room: this.room, senderId: this.userProfile.firstName , message: this.currentMessage });
      this.chatMessages.push(`You: ${this.currentMessage}`);
      this.currentMessage = '';
    }
  }



  // Send a private message
  sendPrivateMessage(receiverId: string) {
    if (this.currentMessage.trim()) {
      this.socket.emit('privateMessage', { senderId: this.userProfile.firstName, receiverId, message: this.currentMessage });
      this.chatMessages.push(`You (to ${receiverId}): ${this.currentMessage}`);
      this.currentMessage = '';
    }
  }

  // Join a room (group chat)
  joinRoom(room: string) {
    this.socket.emit('joinRoom', room);
    console.log(`Joined room: ${room}`);
  }

  // Leave a room
  leaveRoom(room: string) {
    this.socket.emit('leaveRoom', room);
    console.log(`Left room: ${room}`);
  }

  // Play notification sound for new messages
  playNotificationSound() {
    const audio = new Audio('assets/notification.mp3');  // You can replace this with your own sound
    audio.play();
  }
*/

  async fetchUploads(page: number): Promise<void> {
    try {
      const response = await this.http
        .get<{ uploads: Upload[]; totalPages: number }>(
          `http://localhost:3000/api/v1/uploads/uploads?page=${page}`
        )
        .toPromise();

      this.uploads = response?.uploads || [];
      this.totalPages = response?.totalPages || 1;
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  }

  // Move to the next page
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchUploads(this.currentPage);
    }
  }

  // Move to the previous page
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchUploads(this.currentPage);
    }
  }

  // Manually set a page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchUploads(this.currentPage);
    }
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

  previewFiles(filePath: string) {
    if (filePath && filePath !== 'N/A') {
      window.open(filePath, '_blank');
    } else {
      alert('No error file available.');
    }
  }

  // Open the modal for file selection
  openModal() {
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
    this.isPreviewOpen = false;
    document.getElementById('uploadModal')!.style.display = 'none';
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

      this.http
        .post('http://localhost:3000/api/v1/upload/upload', formData)
        .subscribe((response) => {
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
    this.isPreviewOpen = true;
    console.log(this.isPreviewOpen);
    this.previewType = this.getFileType(url);
    this.previewSrc = url;
    if (this.previewType === 'xlsx') {
      const officeViewerBaseUrl =
        'https://view.officeapps.live.com/op/embed.aspx?src=';
      const officeUrl = `${officeViewerBaseUrl}${encodeURIComponent(url)}`;
      this.selectedFileUrl =
        this.santize.bypassSecurityTrustResourceUrl(officeUrl);
      console.log(this.selectedFileUrl);
    } else
      this.selectedFileUrl = this.santize.bypassSecurityTrustResourceUrl(url);
  }

  // Determine the type of file (image, text, pdf)
  getFileType(fileType: string): string {
    const ext = fileType.split('.').pop()?.toLowerCase();
    if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
      return 'image';
    } else if (ext === 'xlsx') {
      return 'xlsx';
    } else if (ext === 'xls') {
      return 'xls';
    } else if (ext === 'pdf') {
      return 'pdf';
    }
    return 'unknown';
  }
  downloadAll() {
    if (this.selectedFiles.length === 1) {
      // If only one file is selected, download it directly
      const selectedFileName = this.selectedFiles[0];
      this.http
        .post(
          'http://localhost:3000/api/v1/upload/download',
          { fileNames: [selectedFileName] },
          { responseType: 'blob' }
        )
        .subscribe((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = selectedFileName; // Download the single file with its name
          link.click(); // Trigger the download
        });
    } else if (this.selectedFiles.length > 1) {
      // If more than one file is selected, download them as a zip
      this.http
        .post(
          'http://localhost:3000/api/v1/upload/download',
          { fileNames: this.selectedFiles },
          { responseType: 'blob' }
        )
        .subscribe((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'files.zip'; // Specify the name of the downloaded zip file
          link.click(); // Trigger the download
        });
    } else {
      // If no files are selected, download all files
      const allFileNames = this.uploadedFiles.map((file) => file.name);
      this.http
        .post(
          'http://localhost:3000/api/v1/upload/download',
          { fileNames: allFileNames },
          { responseType: 'blob' }
        )
        .subscribe((blob) => {
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

  async downloadErrorFile(upload: Upload) {
    try {
      if (upload.error_file_path) {
        const link = document.createElement('a');
        link.href = upload.error_file_path; // Use the file_path provided in the response
        link.download = upload.error_file_path; // Download with the original file name
        link.click();
      } else {
        alert('No file path found for this upload.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  
  fetchUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (data) => {
        sessionStorage.setItem('user_id',data.user_id);
        this.userProfile.firstName = data.firstName;
        this.userProfile.lastName = data.lastName;
        this.userProfile.email = data.email;
        this.userProfile.username = data.username;
        this.userProfile.profileImage = data.profileImage || 'assets/default.jpg';
        console.log(data);
        this.authService.setUser(data.user_id);
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
    
  }

}



/*
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.css']
})
export class FilesUploadComponent implements OnInit {
  uploads: any[] = []; // Stores all uploads
  paginatedFiles: any[] = []; // Stores paginated files
  uploadedFiles: any[] = []; // Stores uploaded files
  selectedFiles: string[] = []; // Tracks selected files for download
  selectedFile: File | null = null;
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 1;
  isModalOpen: boolean = false;
  isPreviewOpen: boolean = false;
  previewSrc: SafeResourceUrl | null = null;
  previewType: string = '';
  selectedFileUrl: SafeResourceUrl | null = null;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.fetchUploadedFiles();

    const openModalButton = document.getElementById('openModalButton');
    if (openModalButton) {
      openModalButton.addEventListener('click', async () => {
        await this.loadUploads();
      });
    }

    const closeModalButton = document.querySelector('.btn-close');
    if (closeModalButton) {
      closeModalButton.addEventListener('click', () => this.closeModal());
    }
  }

  async loadUploads() {
    try {
      const response = await this.http.get<{ uploads: any[] }>('http://localhost:3000/api/v1/uploads/uploads').toPromise();
      this.uploads = response?.uploads || [];
      this.currentPage = 1;
      this.updatePagination();
      this.showModal();
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  }

  fetchUploadedFiles() {
    this.http.get<any>('http://localhost:3000/api/v1/upload/files').subscribe(
      (files) => {
        if (Array.isArray(files.files)) {
          this.uploadedFiles = files.files;
        } else {
          console.error('Invalid response: Expected an array of files', files);
        }
      },
      (error) => console.error('Error fetching uploaded files:', error)
    );
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.uploads.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    this.paginatedFiles = this.uploads.slice(startIndex, startIndex + this.rowsPerPage);
  }

  changePage(direction: number) {
    if ((direction === -1 && this.currentPage > 1) || (direction === 1 && this.currentPage < this.totalPages)) {
      this.currentPage += direction;
      this.updatePagination();
    }
  }

  previewFile(filePath: string) {
    this.isPreviewOpen = true;
    this.previewType = this.getFileType(filePath);
    this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);

    if (this.previewType === 'xlsx') {
      const officeViewerBaseUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=';
      this.selectedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${officeViewerBaseUrl}${encodeURIComponent(filePath)}`);
    } else {
      this.selectedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
    }
  }

  getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'image';
    if (ext === 'xlsx') return 'xlsx';
    if (ext === 'xls') return 'xls';
    if (ext === 'pdf') return 'pdf';
    return 'unknown';
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isPreviewOpen = false;
    document.getElementById("uploadModal")!.style.display = "none";
  }

  showModal() {
    document.getElementById("uploadModal")!.style.display = "block";
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    document.querySelector('.drag-drop-area')!.classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    const dropzone = document.querySelector('.drag-drop-area')!;
    dropzone.classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
    document.querySelector('.drag-drop-area')!.classList.remove('dragover');
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFiles() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.http.post('http://localhost:3000/api/v1/upload/upload', formData).subscribe(() => {
        this.fetchUploadedFiles();
        this.closeModal();
      });
    }
  }

  toggleFileSelection(fileName: string) {
    const index = this.selectedFiles.indexOf(fileName);
    if (index === -1) {
      this.selectedFiles.push(fileName);
    } else {
      this.selectedFiles.splice(index, 1);
    }
  }

  downloadAll() {
    let fileNames = this.selectedFiles.length > 0 ? this.selectedFiles : this.uploadedFiles.map(file => file.name);
    
    this.http.post('http://localhost:3000/api/v1/upload/download', { fileNames }, { responseType: 'blob' }).subscribe(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileNames.length === 1 ? fileNames[0] : 'files.zip';
      link.click();
    });
  }

  downloadFile(fileUrl: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop()!;
    link.click();
  }

  async downloadErrorFile(upload: any) {
    try {
      if (upload.file_path) {
        const link = document.createElement('a');
        link.href = upload.file_path;
        link.download = upload.file_name;
        link.click();
      } else {
        alert('No file path found for this upload.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }
}

*/
