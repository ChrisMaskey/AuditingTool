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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-upload-json',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    CommonModule,
    ToastModule,
  ],
  templateUrl: './feature-upload-json.component.html',
  styleUrl: './feature-upload-json.component.css',
  providers: [
    {
      useClass: UploadJsonService,
      provide: UploadJsonFacade,
    },
    MessageService,
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

  constructor(private messageService: MessageService) {}

  async ngOnInit(): Promise<void> {
    //Initialize the form
    this.uploadJsonForm = this.uploadJsonService.uploadJsonForm;

    //Get Clients
    this.uploadJsonService.getClients();

    //Get Banks
    this.bankSubscription = this.uploadJsonForm
      .get('clientId')
      ?.valueChanges.subscribe(() => {
        this.uploadJsonService.getBanks(
          this.uploadJsonForm.get('clientId')?.value
        );
      });

    // Get Account Numbers
    this.accountSubscription = this.uploadJsonForm
      .get('bank')
      ?.valueChanges.subscribe(() => {
        this.uploadJsonService.getAccounts(
          this.uploadJsonForm.get('clientId')?.value,
          this.uploadJsonForm.get('bank')?.value
        );
      });
  }

  ngOnDestroy(): void {
    this.bankSubscription?.unsubscribe();
    this.accountSubscription?.unsubscribe();
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
        this.showError();
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

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unsupported file format. Please upload a file in JSON format.',
    });
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
        this.showError();
      }
    }
  }
}
