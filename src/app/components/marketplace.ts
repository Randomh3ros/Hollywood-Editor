import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { VideoService, Template } from '../services/video.service';
import { AdService } from '../services/ad.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <header class="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        <!-- ... header content ... -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button routerLink="/" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
              <span class="material-icons">arrow_back</span>
            </button>
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
              Template <span class="text-indigo-500">Marketplace</span>
            </h1>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest">My Templates</button>
            <button (click)="adService.incrementClick()" class="px-4 py-2 rounded-full bg-indigo-600 text-[10px] font-bold uppercase tracking-widest">Upload</button>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="flex gap-4 mb-12">
          <div class="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 px-6 py-4 flex items-center gap-4">
            <span class="material-icons text-zinc-500">search</span>
            <input type="text" placeholder="Search viral styles..." class="bg-transparent border-none focus:ring-0 text-sm w-full">
          </div>
          <button class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span class="material-icons">filter_list</span>
          </button>
        </div>

        <!-- Categories -->
        <div class="flex gap-3 overflow-x-auto no-scrollbar mb-12">
          @for (cat of ['All', 'Podcast', 'Gaming', 'Vlog', 'Cinematic', 'Meme', 'Educational']; track cat) {
            <button class="flex-shrink-0 px-6 py-2 rounded-full border border-zinc-800 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
              {{ cat }}
            </button>
          }
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (template of videoService.allTemplates(); track template.id) {
            <div class="group/template bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden hover:border-indigo-500/50 transition-all">
              <div class="aspect-video relative overflow-hidden">
                <img [src]="template.thumbnailUrl" class="w-full h-full object-cover group-hover/template:opacity-0 transition-opacity" alt="Template Thumbnail" referrerpolicy="no-referrer">
                
                <!-- Video Preview on Hover -->
                <video 
                  class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/template:opacity-100 transition-opacity pointer-events-none"
                  [src]="'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'"
                  [muted]="true"
                  [loop]="true"
                  #previewVideo
                  (mouseenter)="previewVideo.play()"
                  (mouseleave)="previewVideo.pause(); previewVideo.currentTime = 0">
                </video>

                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover/template:opacity-0 transition-opacity"></div>
                <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between group-hover/template:opacity-0 transition-opacity">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-bold">
                      {{ template.author[0] }}
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-300">{{ template.author }}</span>
                  </div>
                  <button (click)="toggleFavorite(template, $event)" class="flex items-center gap-1 text-pink-500 hover:scale-110 transition-transform">
                    <span class="material-icons text-xs">favorite</span>
                    <span class="text-[10px] font-mono">{{ template.favorites }}</span>
                  </button>
                </div>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-bold mb-4">{{ template.name }}</h3>
                <div class="flex gap-2">
                  <button (click)="applyTemplate(template)" class="flex-1 py-3 rounded-xl bg-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20">Apply Style</button>
                  <button class="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                    <span class="material-icons text-sm">visibility</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </header>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class MarketplaceComponent {
  videoService = inject(VideoService);
  adService = inject(AdService);
  router = inject(Router);

  async applyTemplate(template: Template) {
    await this.adService.incrementClick();
    const newProject = this.videoService.createProject(`New ${template.name}`);
    this.router.navigate(['/editor', newProject.id]);
  }

  toggleFavorite(template: Template, event: Event) {
    event.stopPropagation();
    template.favorites += 1;
  }
}
