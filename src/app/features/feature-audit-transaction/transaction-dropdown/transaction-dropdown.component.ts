import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-transaction-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-dropdown.component.html',
  styleUrl: './transaction-dropdown.component.css',
})
export class TransactionDropdownComponent {
  isOpen: boolean = false;

  constructor(private el: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
