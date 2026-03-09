import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isBlocked()) {
      <div class="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
        <div class="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <span class="material-icons text-red-500 text-5xl">security</span>
        </div>
        <h2 class="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">
          Content <span class="text-red-500">Protected</span>
        </h2>
        <p class="text-zinc-500 text-sm max-w-md font-bold uppercase tracking-widest leading-relaxed">
          Screen recording or screenshot attempt detected. Hollywood Editor protects creator intellectual property. 
          Please disable capture software to continue.
        </p>
        <div class="mt-12 flex items-center gap-2 text-[10px] font-mono text-zinc-700 uppercase tracking-[0.3em]">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Secure Session Active
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PrivacyOverlayComponent {
  isBlocked = signal(false);

  @HostListener('window:blur')
  onBlur() {
    // Many screen capture tools cause window blur or focus loss
    // We'll trigger the overlay to discourage recording
    this.isBlocked.set(true);
  }

  @HostListener('window:focus')
  onFocus() {
    this.isBlocked.set(false);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.isBlocked.set(true);
    } else {
      this.isBlocked.set(false);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Block common screenshot shortcuts
    const isScreenshot = 
      (event.key === 'PrintScreen') ||
      (event.metaKey && event.shiftKey && event.key === 'S') || // Mac
      (event.ctrlKey && event.key === 'p') || // Print
      (event.ctrlKey && event.key === 's'); // Save page

    if (isScreenshot) {
      this.isBlocked.set(true);
      setTimeout(() => this.isBlocked.set(false), 3000);
    }
  }
}
