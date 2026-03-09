import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { VideoService, Project } from '../services/video.service';
import { AdService } from '../services/ad.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <!-- Hero Section -->
      <header class="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
            Hollywood<br><span class="text-indigo-500">Editor</span>
          </h1>
          <div class="flex gap-4">
            <button class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors">
              <span class="material-icons">notifications</span>
            </button>
            <button class="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span class="material-icons">person</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  router = inject(Router);

  async createNewProject() {
    await this.adService.incrementClick();
    const newProject = this.videoService.createProject('Untitled Project');
    this.router.navigate(['/editor', newProject.id]);
  }

  async selectProject(project: Project) {
    await this.adService.incrementClick();
    this.videoService.setCurrentProject(project);
    this.router.navigate(['/editor', project.id]);
  }

  async createWithAi() {
    await this.adService.incrementClick();
    this.router.navigate(['/create']);
  }

  async uploadVideo() {
    await this.adService.incrementClick();
    // Simulate upload
    const newProject = this.videoService.createProject('Uploaded Video');
    this.router.navigate(['/editor', newProject.id]);
  }
}
