import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  constructor(private router: Router) {}

  heading?: string;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === '/Transaction') {
          this.heading = 'Search Transaction';
        } else if (this.router.url === '/Upload-Json') {
          this.heading = 'Upload Json';
        } else {
          this.heading = 'Welcome to Audi-Fi';
        }
      });
  }
}
