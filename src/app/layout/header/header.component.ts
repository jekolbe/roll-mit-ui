import { Component, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

type MenuItem = {
  label: string;
  path: string;
  exact: boolean;
};

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./header.html",
})
export class HeaderComponent {
  mobileMenuOpen = false;

  readonly menuItems: MenuItem[] = [
    { label: "Start", path: "/", exact: true },
    { label: "Über Roll Mit", path: "/ueber", exact: false },
    { label: "Strecke", path: "/strecke", exact: false },
    { label: "Mithelfen", path: "/helfen", exact: false },
  ];

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
    // Prevent background scrolling while the overlay is open.
    document.body.style.overflow = "hidden";
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = "";
  }

  toggleMobileMenu(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  trackByPath(_: number, item: MenuItem): string {
    return item.path;
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}
