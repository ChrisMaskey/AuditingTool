import { Injectable, inject } from '@angular/core';
import { UploadJsonFacade } from './upload-json.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class UploadJsonService implements UploadJsonFacade {
  private formBuilder = inject(FormBuilder);
  private requiredValidator = Validators.required;

  public uploadJsonForm!: FormGroup;
  constructor() {
    this.initUploadJsonForm();
  }

  private initUploadJsonForm(): void {
    this.uploadJsonForm = this.formBuilder.group({
      client: ['', this.requiredValidator],
      bank: ['', this.requiredValidator],
      accountNumber: ['', this.requiredValidator],
    });
  }

  public resetForm(): void {
    this.uploadJsonForm.reset();
  }
}
