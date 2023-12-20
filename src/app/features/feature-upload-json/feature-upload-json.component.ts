import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { UploadJsonService } from './application/services/upload-json.service';
import { UploadJsonFacade } from './application/services/upload-json.facade';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

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
export class UploadJsonComponent implements OnInit, OnDestroy {
  private uploadJsonService: UploadJsonFacade = inject(UploadJsonFacade);

  protected clients$ = this.uploadJsonService.clients$;
  protected banks$ = this.uploadJsonService.banks$;
  protected accounts$ = this.uploadJsonService.accounts$;

  protected uploadJsonForm!: FormGroup;

  selectedFile: File | undefined;
  fileExtension: string | undefined;
  fileName: string | undefined;
  InputElement: HTMLInputElement | undefined;
  fileSize: number | undefined;

  private bankSubscription: Subscription | undefined = new Subscription();
  private accountSubscription: Subscription | undefined = new Subscription();

  constructor() {}

  async ngOnInit(): Promise<void> {
    //Initialize the form
    this.uploadJsonForm = this.uploadJsonService.uploadJsonForm;

    //Get Clients
    this.uploadJsonService.getClients();

    //Get Banks
    this.bankSubscription = this.uploadJsonForm
      .get('client')
      ?.valueChanges.subscribe((selectedClient) => {
        if (selectedClient) {
          this.uploadJsonService.getBanks(selectedClient.id);
        }
      });

    //Get Accounts
    this.accountSubscription = this.uploadJsonForm
      .get('bank')
      ?.valueChanges.subscribe((selectedClient) => {
        if (selectedClient) {
          this.uploadJsonService.getAccounts(
            selectedClient.clientId,
            selectedClient.bankName
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.bankSubscription?.unsubscribe();
    this.accountSubscription?.unsubscribe();
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
  // DIRECTIVES
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
