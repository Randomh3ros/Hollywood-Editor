import { Component, inject } from '@angular/core';
import { AdService } from '../services/ad.service';

@Component({
  selector: 'app-ad-overlay',
  standalone: true,
  template: `
    @if (adService.isShowing()) {
      <div class="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white p-6">
        <div class="max-w-md w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div class="relative aspect-video bg-zinc-800 flex items-center justify-center">
            <div class="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] uppercase tracking-widest">Advertisement</div>
            <div class="text-center p-8">
              <div class="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <span class="material-icons text-3xl">play_arrow</span>
              </div>
              <h3 class="text-xl font-bold mb-2">Hollywood Editor Premium</h3>
              <p class="text-zinc-400 text-sm">Upgrade now to remove watermarks and get unlimited AI generations.</p>
            </div>
          </div>
          <div class="p-4 bg-zinc-900 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              <span class="text-xs text-zinc-500 font-mono">AD PLAYING...</span>
            </div>
            <button class="text-xs font-bold text-indigo-400 uppercase tracking-wider opacity-50 cursor-not-allowed">
              Skip in 3s
            </button>
          </div>
        </div>
        <p class="mt-8 text-zinc-500 text-sm italic">Supporting free AI creation</p>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdOverlayComponent {
  adService = inject(AdService);
}
