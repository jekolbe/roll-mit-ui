import { Component, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

type MenuItem = {
  label: string;
  path: string;
  exact: boolean;
  highlight?: boolean;
  children?: MenuItem[];
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
    {
      label: "Über Roll Mit",
      path: "/ueber",
      exact: false,
      children: [
        { label: "Roll Mit 2026", path: "/ueber/2026", exact: true },
      ],
    },
    { label: "Bilder", path: "/bilder", exact: false },
    { label: "Strecke", path: "/strecke", exact: false },
    { label: "Anmeldung", path: "/anmelden", exact: false },
    { label: "Mithelfen", path: "/helfen", exact: false, highlight: true },
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

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}
