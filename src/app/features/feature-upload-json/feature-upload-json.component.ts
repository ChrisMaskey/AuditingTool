import { Component, inject } from '@angular/core';
import { UploadJsonService } from './application/services/upload-json.service';
import { UploadJsonFacade } from './application/services/upload-json.facade';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-upload-json',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DropdownModule],
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

  constructor() {
    this.uploadJsonForm = this.uploadJsonService.uploadJsonForm;
  }

  resetForm(): void {
    this.uploadJsonService.resetForm();
  }
}
