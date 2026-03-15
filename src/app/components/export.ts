import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VideoService } from '../services/video.service';
import { AdService } from '../services/ad.service';
import { NativeService } from '../services/native.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#050505] text-white font-sans p-6">
      <header class="flex items-center justify-between mb-12">
        <button routerLink="/editor/1" class="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="text-xl font-black uppercase italic tracking-widest">Export Video</h1>
        <div class="w-10"></div>
      </header>

      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Preview & Viral Score -->
        <div class="space-y-8">
          <div class="aspect-[9/16] w-full max-w-[300px] mx-auto bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 relative">
            <img [src]="videoService.activeProject()?.thumbnailUrl || 'https://picsum.photos/seed/final/400/711'" 
                 class="w-full h-full object-cover opacity-80"
                 alt="Final Video Preview"
                 referrerpolicy="no-referrer">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <span class="material-icons text-4xl">play_arrow</span>
              </div>
            </div>
          </div>

          <div class="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Viral Score Analysis</h3>
              <div class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">High Potential</div>
            </div>

            <div class="flex items-center gap-6 mb-6">
              <div class="relative w-24 h-24">
                <svg class="w-full h-full" viewBox="0 0 36 36">
                  <path class="text-zinc-800" stroke-width="3" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-indigo-500" stroke-width="3" stroke-dasharray="88, 100" stroke-linecap="round" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-black italic">88</span>
                  <span class="text-[8px] font-bold uppercase text-zinc-500">Score</span>
                </div>
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span class="text-zinc-500">Hook Strength</span>
                  <span>92%</span>
                </div>
                <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 w-[92%]"></div>
                </div>
                <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span class="text-zinc-500">Pacing</span>
                  <span>85%</span>
                </div>
                <div class="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500 w-[85%]"></div>
                </div>
              </div>
            </div>

            <p class="text-xs text-zinc-400 leading-relaxed">
              "The hook is extremely strong and aligns perfectly with current TikTok trends. Consider adding a slightly faster transition at 0:12 to maintain peak engagement."
            </p>
          </div>
        </div>

        <!-- Export Settings -->
        <div class="space-y-8">
          <div>
            <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Select Platform</h3>
            <div class="grid grid-cols-2 gap-4">
              @for (platform of platforms; track platform.id) {
                <button 
                  (click)="selectPlatform(platform.id)"
                  [class.border-indigo-600]="selectedPlatform() === platform.id"
                  [class.border-zinc-800]="selectedPlatform() !== platform.id"
                  class="p-4 rounded-2xl bg-zinc-900 border-2 flex flex-col items-center gap-2 hover:border-zinc-700 transition-all active:scale-95">
                  <span class="material-icons" [class.text-indigo-500]="selectedPlatform() === platform.id" [class.text-zinc-500]="selectedPlatform() !== platform.id">{{ platform.icon }}</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest">{{ platform.name }}</span>
                </button>
              }
            </div>
          </div>

          <div>
            <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Export Quality</h3>
            <div class="flex p-1 bg-zinc-900 rounded-2xl">
              <button 
                (click)="quality.set('1080p')"
                [class.bg-indigo-600]="quality() === '1080p'"
                class="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">1080p (HD)</button>
              <button 
                (click)="quality.set('4k')"
                [class.bg-indigo-600]="quality() === '4k'"
                class="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-all">4K (Premium)</button>
            </div>
          </div>

          <div class="pt-8">
            <button (click)="exportAndShare()" [disabled]="isExporting()" class="w-full py-5 rounded-2xl bg-indigo-600 font-black uppercase italic tracking-widest text-xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100">
              @if (isExporting()) {
                <div class="flex items-center justify-center gap-3">
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Exporting...
                </div>
              } @else {
                Export &amp; Share
              }
            </button>
            <div class="flex items-center justify-center gap-2 mt-4">
              <span class="material-icons text-zinc-600 text-sm">verified</span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No Watermark (Premium)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ExportComponent {
  videoService = inject(VideoService);
  adService = inject(AdService);
  nativeService = inject(NativeService);

  selectedPlatform = signal('tiktok');
  quality = signal<'1080p' | '4k'>('1080p');
  isExporting = signal(false);

  platforms = [
    { id: 'tiktok', name: 'TikTok', icon: 'tiktok' },
    { id: 'youtube', name: 'YouTube Shorts', icon: 'play_circle' },
    { id: 'instagram', name: 'Instagram Reels', icon: 'camera_alt' },
    { id: 'other', name: 'Other', icon: 'more_horiz' }
  ];

  private readonly EXPORT_SIMULATION_DELAY = 1500;

  async selectPlatform(id: string) {
    await this.nativeService.hapticFeedback('light');
    this.selectedPlatform.set(id);
  }

  async exportAndShare() {
    this.isExporting.set(true);
    await this.nativeService.hapticFeedback('medium');
    await this.adService.incrementClick();

    // Simulate export processing
    await new Promise(r => setTimeout(r, this.EXPORT_SIMULATION_DELAY));

    const project = this.videoService.activeProject();
    const projectName = project?.name || 'My Hollywood Video';
    const videoUrl = project?.clips?.[0]?.url;

    const shared = await this.nativeService.share({
      title: projectName,
      text: `Check out my AI-edited video: ${projectName}`,
      url: videoUrl || 'https://hollywood-editor.app',
      dialogTitle: 'Share your video'
    });

    this.isExporting.set(false);

    if (shared) {
      await this.nativeService.hapticNotification('success');
    } else {
      alert('Video exported successfully!');
    }
  }
}
