import { Component, HostListener, inject } from '@angular/core';
import { UploadJsonService } from './application/services/upload-json.service';
import { UploadJsonFacade } from './application/services/upload-json.facade';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-json',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DropdownModule, CommonModule],
  templateUrl: './feature-upload-json.component.html',
  styleUrl: './feature-upload-json.component.css',
  providers: [
    {
      useClass: UploadJsonService,
      provide: UploadJsonFacade,
    },
  ],
})
export class UploadJsonComponent {
  private uploadJsonService: UploadJsonFacade = inject(UploadJsonFacade);

  protected uploadJsonForm!: FormGroup;

  selectedFile: File | undefined;
  fileExtension: string | undefined;
  fileName: string | undefined;
  InputElement: HTMLInputElement | undefined;
  fileSize: number | undefined;

  constructor() {
    this.uploadJsonForm = this.uploadJsonService.uploadJsonForm;
  }

  resetForm(): void {
    this.uploadJsonService.resetForm();
  }

  onFileSelected(event: Event): void {
    this.InputElement = event.target as HTMLInputElement;
    this.selectedFile = this.InputElement.files?.[0];
    this.fileSize = parseFloat(
      (this.selectedFile!.size / (1024 * 1024)).toFixed(2)
    );

    if (this.selectedFile) {
      if (this.isJsonFile(this.selectedFile)) {
        // Do something with the selected JSON file
        console.log('Selected File:', this.selectedFile);
      } else {
        // Handle the case when the file is not a JSON file
        console.log('Selected file is not a JSON file.');
      }
    }
  }

  isJsonFile(file: File): boolean {
    this.fileName = file.name;
    this.fileExtension = file.name.split('.').pop()?.toLowerCase();
    return this.fileExtension === 'json';
  }

  closeAddedFile(): void {
    this.fileExtension = undefined;
    this.fileName = undefined;
    this.selectedFile = undefined;
    if (this.InputElement) {
      this.InputElement.value = '';
    }
  }

  openFile(): void {
    if (this.selectedFile) {
      const fileUrl = URL.createObjectURL(this.selectedFile);
      window.open(fileUrl, '_blank');
    }
  }

  // @TODO MAKE A DIRECTIVE FOLDER
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const dragFiles = event.dataTransfer?.files;
    this.selectedFile = dragFiles?.length ? dragFiles[0] : undefined;
    this.fileSize = parseFloat(
      (this.selectedFile!.size / (1024 * 1024)).toFixed(2)
    );

    if (this.selectedFile) {
      if (this.isJsonFile(this.selectedFile)) {
        // Do something with the selected JSON file
        console.log('Selected File:', this.selectedFile);
      } else {
        // Handle the case when the file is not a JSON file
        console.log('Selected file is not a JSON file.');
      }
    }
  }
}
