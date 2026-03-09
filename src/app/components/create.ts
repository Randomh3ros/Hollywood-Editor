import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AiService } from '../services/ai.service';
import { VideoService } from '../services/video.service';
import { AdService } from '../services/ad.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-transparent text-white font-sans p-6 backdrop-blur-3xl">
      <header class="flex items-center justify-between mb-12">
        <button routerLink="/" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <span class="material-icons">arrow_back</span>
        </button>
        <h1 class="text-xl font-black uppercase italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Create Video</h1>
        <div class="w-10"></div>
      </header>

      <div class="max-w-2xl mx-auto">
        <!-- Mode Selector -->
        <div class="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8">
          <button 
            (click)="mode.set('prompt')"
            [class.bg-indigo-600]="mode() === 'prompt'"
            [class.shadow-lg]="mode() === 'prompt'"
            [class.shadow-indigo-500/20]="mode() === 'prompt'"
            class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95">
            AI Prompt
          </button>
          <button 
            (click)="mode.set('script')"
            [class.bg-indigo-600]="mode() === 'script'"
            [class.shadow-lg]="mode() === 'script'"
            [class.shadow-indigo-500/20]="mode() === 'script'"
            class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95">
            Script
          </button>
          <button 
            (click)="mode.set('upload')"
            [class.bg-indigo-600]="mode() === 'upload'"
            [class.shadow-lg]="mode() === 'upload'"
            [class.shadow-indigo-500/20]="mode() === 'upload'"
            class="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95">
            Upload
          </button>
        </div>

        @if (mode() === 'prompt') {
          <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-white/5 rounded-3xl p-6 border border-white/10">
              <label for="prompt-input" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">What should the video be about?</label>
              <textarea 
                id="prompt-input"
                [(ngModel)]="prompt"
                placeholder="e.g. A motivational video about success with cinematic shots of a city at night..."
                class="w-full bg-transparent border-none focus:ring-0 text-lg resize-none h-40 placeholder:text-zinc-800"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
                <label for="voice-select" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Voice Style</label>
                <select id="voice-select" [(ngModel)]="voice" class="w-full bg-transparent border-none focus:ring-0 text-sm font-bold">
                  <option value="Kore">Male Narrator</option>
                  <option value="Puck">Female Narrator</option>
                  <option value="Zephyr">Dramatic</option>
                  <option value="Fenrir">Podcast</option>
                  <option value="Energetic">Energetic</option>
                  <option value="Calm">Calm</option>
                  <option value="Professional">Professional</option>
                  <option value="Storyteller">Storyteller</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Formal">Formal</option>
                  <option value="Announcer">Announcer</option>
                </select>
              </div>
              <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
                <label for="aspect-select" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Aspect Ratio</label>
                <select id="aspect-select" [(ngModel)]="aspectRatio" class="w-full bg-transparent border-none focus:ring-0 text-sm font-bold">
                  <option value="9:16">9:16 (TikTok/Reels)</option>
                  <option value="16:9">16:9 (YouTube)</option>
                  <option value="1:1">1:1 (Instagram)</option>
                </select>
              </div>
            </div>

            <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
              <label for="resolution-select" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Resolution</label>
              <div class="flex gap-4">
                <button (click)="resolution.set('720p')" 
                        [class.bg-indigo-600]="resolution() === '720p'"
                        [class.bg-white/5]="resolution() !== '720p'"
                        class="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all hover:scale-105 active:scale-95">
                  720p (Fast)
                </button>
                <button (click)="resolution.set('1080p')" 
                        [class.bg-indigo-600]="resolution() === '1080p'"
                        [class.bg-white/5]="resolution() !== '1080p'"
                        class="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all hover:scale-105 active:scale-95">
                  1080p (HD)
                </button>
              </div>
            </div>

            <div class="bg-white/5 rounded-3xl p-6 border border-white/10">
              <p class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Visual Style</p>
              <div class="grid grid-cols-3 gap-3">
                @for (style of ['Cinematic', 'Cartoon', 'Realistic', 'Cyberpunk', 'Anime', 'Vintage', 'Retro', 'Minimalist', 'Documentary', 'Abstract']; track style) {
                  <button 
                    (click)="visualStyle = style"
                    [class.border-indigo-500]="visualStyle === style"
                    [class.bg-indigo-600/10]="visualStyle === style"
                    class="p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 transition-all hover:border-white/20 hover:scale-105 active:scale-95">
                    <span class="material-icons text-xl" [class.text-indigo-400]="visualStyle === style">
                      {{ 
                        style === 'Cinematic' ? 'movie' : 
                        style === 'Cartoon' ? 'brush' : 
                        style === 'Realistic' ? 'camera_alt' : 
                        style === 'Cyberpunk' ? 'bolt' : 
                        style === 'Anime' ? 'face' : 
                        style === 'Retro' ? 'history' :
                        style === 'Minimalist' ? 'filter_none' :
                        style === 'Documentary' ? 'public' :
                        style === 'Abstract' ? 'auto_fix_high' :
                        'videocam' 
                      }}
                    </span>
                    <span class="text-[8px] font-bold uppercase tracking-widest">{{ style }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }

        @if (mode() === 'script') {
          <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
              <label for="script-input" class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Paste your script</label>
              <textarea 
                id="script-input"
                [(ngModel)]="script"
                placeholder="Speaker 1: Welcome to the future of editing..."
                class="w-full bg-transparent border-none focus:ring-0 text-lg resize-none h-64 placeholder:text-zinc-700"
              ></textarea>
            </div>
          </div>
        }

        @if (mode() === 'upload') {
          <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="aspect-video rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center group hover:border-indigo-500/50 transition-colors cursor-pointer">
              <div class="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <span class="material-icons text-3xl">cloud_upload</span>
              </div>
              <p class="font-bold">Drop raw footage here</p>
              <p class="text-xs text-zinc-500 mt-2">MP4, MOV up to 500MB</p>
            </div>
          </div>
        }

        <div class="mt-12">
          <button 
            (click)="generate()"
            [disabled]="isGenerating()"
            class="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 font-black uppercase italic tracking-widest text-xl shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100">
            @if (isGenerating()) {
              <div class="flex items-center justify-center gap-3">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </div>
            } @else {
              Generate Video
            }
          </button>
          <p class="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest">
            Free version: Ad will play before generation
          </p>
        </div>
      </div>

      <!-- Generation Progress Overlay -->
      @if (isGenerating()) {
        <div class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <div class="w-24 h-24 mb-8 relative">
            <div class="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-icons text-4xl text-indigo-500">movie</span>
            </div>
          </div>
          <h2 class="text-2xl font-black italic uppercase mb-2">{{ progressTitle() }}</h2>
          <p class="text-zinc-400 max-w-xs">{{ progressSubtitle() }}</p>
          
          <div class="w-full max-w-xs h-1 bg-zinc-800 rounded-full mt-8 overflow-hidden">
            <div class="h-full bg-indigo-500 transition-all duration-1000" [style.width.%]="progress()"></div>
          </div>
          <div class="mt-2 font-mono text-[10px] text-zinc-500">{{ progress() }}% COMPLETE</div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CreateComponent {
  mode = signal<'prompt' | 'script' | 'upload'>('prompt');
  prompt = '';
  script = '';
  voice = 'Kore';
  visualStyle = 'Cinematic';
  aspectRatio = '9:16';
  resolution = signal<'720p' | '1080p'>('720p');
  
  isGenerating = signal(false);
  progress = signal(0);
  progressTitle = signal('Analyzing Prompt');
  progressSubtitle = signal('Our AI is crafting the perfect script for your viral video.');

  aiService = inject(AiService);
  videoService = inject(VideoService);
  adService = inject(AdService);
  router = inject(Router);

  async generate() {
    if (this.mode() === 'prompt' && !this.prompt) return;
    
    // 1. Track significant action (Monetization rule)
    await this.adService.incrementClick();

    // 2. Start Generation
    this.isGenerating.set(true);
    this.progress.set(10);
    
    try {
      // Step 1: Scripting
      this.progressTitle.set('Writing Script');
      this.progressSubtitle.set('Generating engaging hooks and narrative structure...');
      await new Promise(r => setTimeout(r, 2000));
      this.progress.set(30);

      // Step 2: Visuals
      this.progressTitle.set(`Generating ${this.visualStyle} Visuals`);
      this.progressSubtitle.set(`Creating ${this.visualStyle.toLowerCase()} scenes in ${this.resolution()} at ${this.aspectRatio}...`);
      
      // Call the refined AI service
      const videoUrl = await this.aiService.generateVideo(
        this.prompt, 
        this.visualStyle, 
        this.resolution(), 
        this.aspectRatio as '16:9' | '9:16' | '1:1'
      );
      
      this.progress.set(60);

      // Step 3: Audio
      this.progressTitle.set('Synthesizing Voice');
      this.progressSubtitle.set('Applying professional narration with AI voice cloning...');
      await new Promise(r => setTimeout(r, 2000));
      this.progress.set(85);

      // Step 4: Finalizing
      this.progressTitle.set('Auto Editing');
      this.progressSubtitle.set('Adding transitions, captions, and beat-syncing music...');
      await new Promise(r => setTimeout(r, 2000));
      this.progress.set(100);

      // Create project and navigate
      const project = this.videoService.createProject(this.prompt || 'New AI Video');
      this.videoService.updateProject({
        thumbnailUrl: 'https://picsum.photos/seed/' + Math.random() + '/400/711',
        clips: [{
          id: 'clip-1',
          url: videoUrl,
          startTime: 0,
          duration: 15,
          type: 'generated'
        }]
      });

      this.router.navigate(['/editor', project.id]);
    } catch (e) {
      console.error(e);
      alert('Generation failed. Please try again.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
