import { FormGroup } from '@angular/forms';

export abstract class UploadJsonFacade {
  abstract uploadJsonForm: FormGroup;

  /**
   * Resets the Upload Json Form
   */
  abstract resetForm(): void;
}
