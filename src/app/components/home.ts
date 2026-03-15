import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { VideoService, Project } from '../services/video.service';
import { AdService } from '../services/ad.service';
import { NativeService } from '../services/native.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <!-- Hero Section -->
      <header class="pt-24 pb-20 px-6 max-w-7xl mx-auto relative overflow-hidden rounded-3xl mt-6">
        <!-- Cinematic Background Image -->
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1581010866019-907fd990d62e?q=80&w=2070&auto=format&fit=crop" 
               alt="Hollywood Sunset" 
               class="w-full h-full object-cover opacity-60 scale-110"
               referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
        </div>
        
        <div class="flex items-center justify-between mb-8 relative z-10">
          <h1 class="text-5xl md:text-7xl font-black tracking-tighter uppercase italic flex flex-col">
            <span class="relative inline-block text-transparent bg-clip-text bg-cover bg-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-shimmer" 
                  style="background-image: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(209,213,219,0.9) 50%, rgba(255,255,255,0.9) 100%), url('https://images.unsplash.com/photo-1542704792-e30dac463c90?q=80&w=2070&auto=format&fit=crop'); background-size: 200% auto, cover; -webkit-background-clip: text; -webkit-text-stroke: 1px rgba(255,255,255,0.3); background-blend-mode: overlay;">
              Hollywood
              <span class="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></span>
            </span>
            <span class="text-indigo-400 mt-[-0.1em] relative flex items-center gap-4 drop-shadow-lg">
              Editor
              <span class="h-[3px] flex-grow bg-gradient-to-r from-indigo-400 to-transparent rounded-full shadow-[0_0_15px_rgba(129,140,248,0.5)]"></span>
            </span>
          </h1>
          <div class="flex gap-4 animate-in fade-in duration-1000 slide-in-from-right-8 hover:scale-105 transition-transform">
            <button class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors">
              <span class="material-icons">notifications</span>
            </button>
            <button class="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span class="material-icons">person</span>
            </button>
          </div>
        </div>

        <!-- Red Carpet & Photographers -->
        <div class="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none">
          <!-- The Red Carpet -->
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-16 bg-gradient-to-t from-red-700 to-red-600 skew-x-[-15deg] shadow-[0_-10px_30px_rgba(185,28,28,0.4)]"></div>
          
          <!-- Photographers Line -->
          <div class="absolute bottom-4 left-0 right-0 flex justify-around items-end px-12">
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="relative flex flex-col items-center">
                <!-- Photographer Silhouette -->
                <div class="w-8 h-12 bg-zinc-900 rounded-t-lg opacity-80"></div>
                <!-- Camera Flash -->
                <div class="absolute -top-2 w-4 h-4 bg-white rounded-full blur-sm animate-flash"
                     [style.animation-delay]="(i * 0.3) + 's'"
                     [style.animation-duration]="(0.5 + (i % 3) * 0.2) + 's'"></div>
                <div class="absolute -top-4 w-12 h-12 bg-white/20 rounded-full blur-xl animate-flash"
                     [style.animation-delay]="(i * 0.3) + 's'"
                     [style.animation-duration]="(0.5 + (i % 3) * 0.2) + 's'"></div>
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
          <button (click)="createWithAi()" class="group relative overflow-hidden rounded-3xl bg-indigo-600 p-8 h-64 flex flex-col justify-end transition-all hover:scale-[1.02] active:scale-[0.98] text-left w-full">
            <div class="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <span class="material-icons text-9xl">auto_awesome</span>
            </div>
            <h2 class="text-3xl font-bold mb-2">Create with AI</h2>
            <p class="text-indigo-100 opacity-80">Turn prompts or scripts into viral videos instantly.</p>
            <div class="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              Start Creating <span class="material-icons text-sm">arrow_forward</span>
            </div>
          </button>

          <button (click)="uploadVideo()" class="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 h-64 flex flex-col justify-end transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left w-full">
            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <span class="material-icons text-9xl">cloud_upload</span>
            </div>
            <h2 class="text-3xl font-bold mb-2">Upload Video</h2>
            <p class="text-zinc-400">Auto-edit long footage into social-ready clips.</p>
            <div class="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-400">
              Upload Raw <span class="material-icons text-sm">arrow_forward</span>
            </div>
          </button>
        </div>
      </header>

      <!-- Recent Projects -->
      <section class="px-6 max-w-7xl mx-auto mb-12">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold uppercase tracking-tight text-zinc-500">Recent Projects</h3>
          <button class="text-sm font-bold text-indigo-400 uppercase tracking-widest">View All</button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (project of videoService.allProjects(); track project.id) {
            <button class="group cursor-pointer text-left w-full" (click)="selectProject(project)">
              <div class="aspect-[9/16] rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative mb-3">
                <img [src]="project.thumbnailUrl || 'https://picsum.photos/seed/' + project.id + '/400/711'" 
                     class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
                     alt="Project Thumbnail"
                     referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div class="absolute bottom-3 left-3">
                  <div class="text-[10px] font-mono text-zinc-400 uppercase mb-1">{{ project.createdAt | date:'MMM d' }}</div>
                  <div class="font-bold text-sm truncate w-32">{{ project.name }}</div>
                </div>
                <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <span class="material-icons text-sm">more_vert</span>
                  </div>
                </div>
              </div>
            </button>
          }
          
          <button (click)="createNewProject()" class="aspect-[9/16] rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-colors cursor-pointer">
            <span class="material-icons text-4xl mb-2">add</span>
            <span class="text-xs font-bold uppercase tracking-widest">New Project</span>
          </button>
        </div>
      </section>

      <!-- Templates -->
      <section class="px-6 max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold uppercase tracking-tight text-zinc-500">Trending Templates</h3>
          <button routerLink="/marketplace" class="text-sm font-bold text-indigo-400 uppercase tracking-widest">Marketplace</button>
        </div>

        <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex-shrink-0 w-40 group/template">
              <div class="aspect-[9/16] rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative mb-2">
                <img [src]="'https://picsum.photos/seed/template' + i + '/400/711'" 
                     class="w-full h-full object-cover opacity-40 group-hover/template:opacity-0 transition-opacity"
                     alt="Template Preview"
                     referrerpolicy="no-referrer">
                
                <!-- Video Preview on Hover -->
                <video 
                  class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/template:opacity-100 transition-opacity pointer-events-none"
                  [src]="'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'"
                  [muted]="true"
                  [loop]="true"
                  #previewVideo
                  (mouseenter)="previewVideo.play()"
                  (mouseleave)="previewVideo.pause(); previewVideo.currentTime = 0">
                </video>

                <div class="absolute inset-0 flex items-center justify-center group-hover/template:hidden transition-all">
                  <span class="material-icons text-white/50">play_circle</span>
                </div>
              </div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Influencer Style {{i}}</div>
            </div>
          }
        </div>
      </section>

      <!-- Navigation Bar -->
      <nav class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-zinc-800 px-6 py-4 flex justify-around items-center z-50">
        <button class="flex flex-col items-center gap-1 text-indigo-500">
          <span class="material-icons">home</span>
          <span class="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button class="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <span class="material-icons">explore</span>
          <span class="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>
        <button class="w-14 h-14 -mt-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/40 border-4 border-black">
          <span class="material-icons text-white">add</span>
        </button>
        <button class="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <span class="material-icons">auto_fix_high</span>
          <span class="text-[10px] font-bold uppercase tracking-tighter">Tools</span>
        </button>
        <button class="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <span class="material-icons">settings</span>
          <span class="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class HomeComponent {
  videoService = inject(VideoService);
  adService = inject(AdService);
  nativeService = inject(NativeService);
  router = inject(Router);

  async createNewProject() {
    await this.nativeService.hapticFeedback('medium');
    await this.adService.incrementClick();
    const newProject = this.videoService.createProject('Untitled Project');
    this.router.navigate(['/editor', newProject.id]);
  }

  async selectProject(project: Project) {
    await this.nativeService.hapticFeedback('light');
    await this.adService.incrementClick();
    this.videoService.setCurrentProject(project);
    this.router.navigate(['/editor', project.id]);
  }

  async createWithAi() {
    await this.nativeService.hapticFeedback('medium');
    await this.adService.incrementClick();
    this.router.navigate(['/create']);
  }

  async uploadVideo() {
    await this.nativeService.hapticFeedback('light');
    await this.adService.incrementClick();

    const picked = await this.nativeService.pickVideoFile();
    const newProject = this.videoService.createProject(picked?.name?.replace(/\.[^/.]+$/, '') || 'Uploaded Video');

    if (picked?.webPath) {
      this.videoService.updateProject({
        clips: [{
          id: 'clip-upload-1',
          url: picked.webPath,
          startTime: 0,
          duration: 30,
          type: 'video'
        }]
      });
    }

    this.router.navigate(['/editor', newProject.id]);
  }
}
