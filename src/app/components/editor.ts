import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VideoService, Project, AudioTrack, LibraryTrack, Template } from '../services/video.service';
import { AiService, ScriptResult } from '../services/ai.service';
import { AdService } from '../services/ad.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="h-screen bg-transparent text-white font-sans flex flex-col overflow-hidden backdrop-blur-3xl">
      <!-- Header -->
      <header class="h-16 border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 bg-black/20">
        <div class="flex items-center gap-4">
          <button routerLink="/" class="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95" (click)="adService.incrementClick(false)">
            <span class="material-icons">close</span>
          </button>
          <div class="h-4 w-[1px] bg-white/10"></div>
          <h1 class="font-black text-xs uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">{{ project()?.name }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 mr-4">
            <button (click)="videoService.undo()" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
              <span class="material-icons text-sm">undo</span>
            </button>
            <button (click)="videoService.redo()" class="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
              <span class="material-icons text-sm">redo</span>
            </button>
          </div>

          @if (!videoService.proStatus()) {
            <button (click)="goPro()" class="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <span class="material-icons text-sm">workspace_premium</span>
              Go Pro
            </button>
          } @else {
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-amber-500/30 animate-pulse">
              <span class="material-icons text-xs text-amber-500">workspace_premium</span>
              <span class="text-[8px] font-black text-amber-500 uppercase tracking-widest">Pro Member</span>
            </div>
          }
          <button (click)="saveProject()" class="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
            Save
          </button>
          <button class="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:scale-105 active:scale-95 transition-all" (click)="adService.incrementClick(false)">
            Preview
          </button>
          <button routerLink="/export" class="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all" (click)="adService.incrementClick()">
            Export
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Sidebar: Tools -->
        <aside class="w-20 border-r border-white/10 flex flex-col items-center py-6 gap-8 flex-shrink-0 bg-black/10">
          <button class="flex flex-col items-center gap-1 text-indigo-400 hover:scale-110 transition-all active:scale-90" (click)="showAiGeneratePanel.set(!showAiGeneratePanel())">
            <span class="material-icons">auto_fix_high</span>
            <span class="text-[8px] font-bold uppercase tracking-tighter">AI Gen</span>
          </button>
          <button class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white hover:scale-110 transition-all active:scale-90" (click)="showScriptAssistant.set(!showScriptAssistant())">
            <span class="material-icons">description</span>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Script</span>
          </button>
          <button class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white hover:scale-110 transition-all active:scale-90" (click)="showTemplateSelector.set(!showTemplateSelector())">
            <span class="material-icons">dashboard</span>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Templates</span>
          </button>
          <button class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white hover:scale-110 transition-all active:scale-90" (click)="openImageGenerator()">
            <span class="material-icons">image</span>
            <span class="text-[8px] font-bold uppercase tracking-tighter">AI Image</span>
          </button>
          <button class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white hover:scale-110 transition-all active:scale-90" 
                  [class.text-indigo-400]="showAudioPanel()"
                  (click)="toggleAudioPanel()">
            <span class="material-icons">music_note</span>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Audio</span>
          </button>
          <button class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white hover:scale-110 transition-all active:scale-90" (click)="adService.incrementClick(false)">
            <span class="material-icons">subtitles</span>
            <span class="text-[8px] font-bold uppercase tracking-tighter">Captions</span>
          </button>
        </aside>

        <!-- Center: Video Preview -->
        <main class="flex-1 flex flex-col items-center justify-center p-8 relative bg-black/5">
          <div class="aspect-[9/16] h-full max-h-[600px] bg-black rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative border transition-all duration-700"
               [class.border-white/10]="!isBeatSyncing()"
               [class.border-indigo-500]="isBeatSyncing()"
               [class.shadow-[0_0_80px_rgba(99,102,241,0.4)]]="isBeatSyncing()"
               [class.scale-[1.02]]="isBeatSyncing()">
            
            <!-- Real-time Preview Video/Image -->
            @if (project()?.clips?.length) {
              <video [src]="project()?.clips?.[0]?.url" 
                     class="w-full h-full object-cover"
                     autoplay loop muted playsinline
                     referrerpolicy="no-referrer"></video>
            } @else {
              <img [src]="project()?.thumbnailUrl || 'https://picsum.photos/seed/preview/400/711'" 
                   class="w-full h-full object-cover"
                   alt="Main Video Preview"
                   referrerpolicy="no-referrer">
            }
            
            <!-- Beat Sync Pulse Overlay -->
            @if (isBeatSyncing()) {
              <div class="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none flex items-center justify-center">
                <div class="flex flex-col items-center gap-2">
                  <span class="material-icons text-4xl text-indigo-400 animate-bounce">music_note</span>
                  <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Syncing Beats...</span>
                </div>
              </div>
            }
            
            <!-- Simulated Captions -->
            <div class="absolute bottom-20 left-0 right-0 px-6 text-center">
              <span class="bg-yellow-400 text-black px-2 py-1 font-black italic uppercase text-2xl shadow-lg">
                {{ activeCaption() }}
              </span>
            </div>

            <!-- Playback Controls -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
              <button class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
                <span class="material-icons text-4xl">play_arrow</span>
              </button>
            </div>
          </div>

          <!-- AI Floating Actions -->
          <div class="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button (click)="autoEdit()" class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-110 hover:rotate-3 hover:bg-indigo-500 transition-all group">
              <span class="material-icons">auto_awesome</span>
              <div class="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Auto Edit</div>
            </button>
            <button (click)="generateHooks()" class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all group">
              <span class="material-icons">anchor</span>
              <div class="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Viral Hooks</div>
            </button>
            <button (click)="beatSync()" class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all group">
              <span class="material-icons">music_note</span>
              <div class="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Beat Sync</div>
            </button>
            <button (click)="storyEdit()" class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all group">
              <span class="material-icons">history_edu</span>
              <div class="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Story Edit</div>
            </button>
            <button (click)="saveTemplate()" class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-700 hover:scale-110 transition-all group">
              <span class="material-icons">save</span>
              <div class="absolute right-full mr-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Save Template</div>
            </button>
          </div>
        </main>

        <!-- Right Sidebar: Properties/AI Suggestions -->
        <aside class="w-80 border-l border-white/10 bg-black/20 p-6 flex flex-col gap-6 overflow-y-auto backdrop-blur-md">
          @if (showAiGeneratePanel()) {
            <div class="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Scene Generator</h3>
                <button (click)="showAiGeneratePanel.set(false)" class="text-zinc-500 hover:text-white"><span class="material-icons text-sm">close</span></button>
              </div>
              
              <div class="space-y-4">
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <label for="ai-prompt-area" class="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Scene Prompt</label>
                  <textarea id="ai-prompt-area" [(ngModel)]="aiPrompt" placeholder="Describe the scene..." class="w-full bg-transparent border-none focus:ring-0 text-xs h-24 resize-none"></textarea>
                  
                  <div class="mt-4 pt-4 border-t border-white/5">
                    <p class="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3">Suggestions</p>
                    <div class="flex flex-wrap gap-2">
                      @for (suggestion of promptSuggestions(); track suggestion.label) {
                        <button (click)="aiPrompt.set(suggestion.prompt)" 
                                class="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-wider hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all text-zinc-400 hover:text-white">
                          {{ suggestion.label }}
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-white/5 p-3 rounded-xl border border-white/10">
                    <label for="ai-transition-select" class="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Transition</label>
                    <select id="ai-transition-select" [(ngModel)]="aiTransition" class="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase">
                      <option value="fade">Fade</option>
                      <option value="dissolve">Dissolve</option>
                      <option value="wipe">Wipe</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                  <div class="bg-white/5 p-3 rounded-xl border border-white/10">
                    <label for="ai-animation-select" class="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Text Animation</label>
                    <select id="ai-animation-select" [(ngModel)]="aiAnimation" class="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase">
                      <option value="zoom-in">Zoom In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="typewriter">Typewriter</option>
                      <option value="glitch">Glitch</option>
                    </select>
                  </div>
                </div>

                <button (click)="generateAiScene()" [disabled]="!aiPrompt()" class="w-full py-4 rounded-2xl bg-indigo-600 font-black uppercase italic tracking-widest text-xs shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  Generate Scene
                </button>
              </div>
            </div>
          } @else if (showScriptAssistant()) {
            <div class="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Script Assistant</h3>
                <button (click)="showScriptAssistant.set(false)" class="text-zinc-500 hover:text-white"><span class="material-icons text-sm">close</span></button>
              </div>

              <div class="space-y-4">
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <label for="script-topic-input" class="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Topic</label>
                  <input id="script-topic-input" type="text" [(ngModel)]="scriptTopic" placeholder="e.g. Future of AI" class="w-full bg-transparent border-none focus:ring-0 text-xs font-bold">
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <label for="script-keywords-input" class="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Keywords (comma separated)</label>
                  <input id="script-keywords-input" type="text" [(ngModel)]="scriptKeywords" placeholder="e.g. tech, innovation, robots" class="w-full bg-transparent border-none focus:ring-0 text-xs font-bold">
                </div>
                <button (click)="generateScript()" [disabled]="!scriptTopic()" class="w-full py-4 rounded-2xl bg-emerald-600 font-black uppercase italic tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  Generate Script
                </button>

                @if (generatedScript(); as script) {
                  <div class="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 animate-in slide-in-from-bottom-2">
                    <h4 class="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">{{ script.title }}</h4>
                    <p class="text-[10px] text-zinc-400 leading-relaxed max-h-40 overflow-y-auto no-scrollbar">{{ script.script }}</p>
                  </div>
                }
              </div>
            </div>
          } @else if (showTemplateSelector()) {
            <div class="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Video Templates</h3>
                <button (click)="showTemplateSelector.set(false)" class="text-zinc-500 hover:text-white"><span class="material-icons text-sm">close</span></button>
              </div>
              <div class="grid grid-cols-1 gap-4">
                @for (temp of videoService.allTemplates(); track temp.id) {
                  <button (click)="applyTemplate(temp)" class="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all">
                    <img [src]="temp.thumbnailUrl" [alt]="temp.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerpolicy="no-referrer">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                      <p class="text-[10px] font-black uppercase tracking-widest text-white">{{ temp.name }}</p>
                      <p class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">By {{ temp.author }}</p>
                    </div>
                  </button>
                }
              </div>
            </div>
          } @else if (showAudioPanel()) {
            <div class="animate-in fade-in slide-in-from-right-4 duration-300">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Audio Editing</h3>
                <button (click)="showAudioPanel.set(false)" class="text-zinc-500 hover:text-white">
                  <span class="material-icons text-sm">close</span>
                </button>
              </div>

              @if (selectedAudioTrack(); as track) {
                <div class="space-y-6">
                  <!-- Volume Control -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <label for="volume-slider" class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Volume</label>
                      <span class="text-[10px] font-mono text-indigo-400">{{ Math.round(track.volume * 100) }}%</span>
                    </div>
                    <input id="volume-slider" type="range" min="0" max="1" step="0.01" 
                           [value]="track.volume"
                           (input)="updateAudioVolume($event)"
                           class="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer">
                  </div>

                  <!-- Fade In/Out -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-3">
                      <label for="fade-in-input" class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fade In</label>
                      <div class="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                        <input id="fade-in-input" type="number" min="0" max="10" step="0.1"
                               [value]="track.fadeIn"
                               (input)="updateAudioFade($event, 'in')"
                               class="bg-transparent text-xs font-mono w-full outline-none">
                        <span class="text-[8px] text-zinc-500 uppercase">s</span>
                      </div>
                    </div>
                    <div class="space-y-3">
                      <label for="fade-out-input" class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fade Out</label>
                      <div class="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                        <input id="fade-out-input" type="number" min="0" max="10" step="0.1"
                               [value]="track.fadeOut"
                               (input)="updateAudioFade($event, 'out')"
                               class="bg-transparent text-xs font-mono w-full outline-none">
                        <span class="text-[8px] text-zinc-500 uppercase">s</span>
                      </div>
                    </div>
                  </div>

                  <!-- Advanced Audio Features -->
                  <div class="space-y-4 pt-4 border-t border-zinc-800">
                    <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Advanced Tools</p>
                    
                    <!-- Audio Ducking -->
                    <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                      <div class="flex flex-col">
                        <span class="text-[10px] font-bold uppercase tracking-widest">Audio Ducking</span>
                        <span class="text-[8px] text-zinc-500 uppercase">Auto-lower music for voice</span>
                      </div>
                      <button (click)="toggleDucking()" 
                              class="w-10 h-5 rounded-full transition-colors relative"
                              [class.bg-indigo-600]="isDuckingEnabled()"
                              [class.bg-zinc-700]="!isDuckingEnabled()">
                        <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform"
                             [class.translate-x-5]="isDuckingEnabled()"></div>
                      </button>
                    </div>

                    <!-- EQ Adjustments -->
                    <div class="space-y-3">
                      <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">EQ Preset</p>
                      <div class="grid grid-cols-3 gap-2">
                        @for (eq of ['Flat', 'Bass', 'Treble', 'Vocal', 'Pop', 'Rock', 'Radio', 'Phone', 'Deep Bass']; track eq) {
                          <button (click)="applyEQ(eq)" 
                                  class="py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all"
                                  [class.bg-indigo-600]="activeEQ() === eq"
                                  [class.bg-zinc-800]="activeEQ() !== eq"
                                  [class.border]="activeEQ() === eq"
                                  [class.border-indigo-400]="activeEQ() === eq">
                            {{ eq }}
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Visual Waveform Editor (Interactive) -->
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Waveform Editor</p>
                        <span class="text-[8px] font-mono text-indigo-400">0:00 - {{ Math.floor(track.duration / 60) }}:{{ (track.duration % 60).toString().padStart(2, '0') }}</span>
                      </div>
                      <div class="h-24 bg-black rounded-xl border border-zinc-800 relative overflow-hidden group">
                        <!-- Waveform Bars -->
                        <div class="absolute inset-0 flex items-center px-4 gap-[2px]">
                          @for (h of waveformHeights; track $index) {
                            <div class="flex-1 bg-indigo-500/20 rounded-full transition-all group-hover:bg-indigo-500/40 relative" 
                                 [style.height.%]="h">
                              <!-- Active part of the waveform -->
                              @if ($index >= waveformSelectionStart() && $index <= waveformSelectionEnd()) {
                                <div class="absolute inset-0 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                              }
                            </div>
                          }
                        </div>
                        
                        <!-- Selection Handles -->
                        <div class="absolute inset-y-0 bg-indigo-500/10 border-x border-indigo-500/50"
                             [style.left.%]="(waveformSelectionStart() / waveformHeights.length) * 100"
                             [style.right.%]="100 - (waveformSelectionEnd() / waveformHeights.length) * 100">
                          
                          <!-- Left Handle -->
                          <div class="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-8 bg-indigo-500 rounded-full cursor-ew-resize flex items-center justify-center shadow-lg border border-white/20">
                            <div class="w-[1px] h-3 bg-white/50"></div>
                          </div>
                          
                          <!-- Right Handle -->
                          <div class="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-8 bg-indigo-500 rounded-full cursor-ew-resize flex items-center justify-center shadow-lg border border-white/20">
                            <div class="w-[1px] h-3 bg-white/50"></div>
                          </div>
                        </div>

                        <!-- Time Indicators -->
                        <div class="absolute top-1 left-2 bg-black/60 backdrop-blur-sm text-[8px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                          {{ formatWaveformTime(waveformSelectionStart()) }}
                        </div>
                        <div class="absolute top-1 right-2 bg-black/60 backdrop-blur-sm text-[8px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                          {{ formatWaveformTime(waveformSelectionEnd()) }}
                        </div>
                      </div>
                      
                      <div class="flex items-center justify-between px-1">
                        <button (click)="adjustSelection('start', -1)" class="text-zinc-600 hover:text-white"><span class="material-icons text-xs">chevron_left</span></button>
                        <p class="text-[8px] text-zinc-600 uppercase italic">Fine-tune selection with handles</p>
                        <button (click)="adjustSelection('end', 1)" class="text-zinc-600 hover:text-white"><span class="material-icons text-xs">chevron_right</span></button>
                      </div>
                    </div>
                  </div>

                  <!-- Mixing Presets -->
                  <div class="space-y-3 pt-4 border-t border-zinc-800">
                    <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mixing Presets</p>
                    <div class="grid grid-cols-2 gap-2">
                      <button (click)="applyMixingPreset('background')" class="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-[8px] font-bold uppercase tracking-widest hover:border-indigo-500 transition-colors flex flex-col items-center gap-1">
                        <span class="material-icons text-sm">music_note</span>
                        Background
                      </button>
                      <button (click)="applyMixingPreset('voiceover')" class="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-[8px] font-bold uppercase tracking-widest hover:border-indigo-500 transition-colors flex flex-col items-center gap-1">
                        <span class="material-icons text-sm">record_voice_over</span>
                        Voiceover Focus
                      </button>
                      <button (click)="applyMixingPreset('cinematic')" class="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-[8px] font-bold uppercase tracking-widest hover:border-indigo-500 transition-colors flex flex-col items-center gap-1">
                        <span class="material-icons text-sm">movie</span>
                        Cinematic Mix
                      </button>
                      <button (click)="applyMixingPreset('mute')" class="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-[8px] font-bold uppercase tracking-widest hover:border-red-500 transition-colors flex flex-col items-center gap-1">
                        <span class="material-icons text-sm">volume_off</span>
                        Mute
                      </button>
                    </div>
                  </div>

                  <button (click)="showAudioLibrary.set(true)" class="w-full py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-2">
                    <span class="material-icons text-sm">library_music</span>
                    Browse Library
                  </button>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-12 text-center">
                  <span class="material-icons text-zinc-800 text-4xl mb-4">music_off</span>
                  <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Select an audio track to edit</p>
                </div>
              }
            </div>
          } @else if (showStoryElements()) {
            <div class="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Story Analysis</h3>
              <div class="space-y-3">
                @for (el of project()?.storyElements; track $index) {
                  <div class="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 hover:border-indigo-500/50 transition-colors cursor-pointer">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="material-icons text-xs" [ngClass]="{
                          'text-pink-500': el.type === 'emotional',
                          'text-yellow-500': el.type === 'comedic',
                          'text-blue-500': el.type === 'dramatic',
                          'text-emerald-500': el.type === 'dialogue'
                        }">
                          {{ el.type === 'emotional' ? 'favorite' : el.type === 'comedic' ? 'sentiment_very_satisfied' : el.type === 'dramatic' ? 'priority_high' : 'chat' }}
                        </span>
                        <span class="text-[10px] font-bold uppercase tracking-widest">{{ el.type }}</span>
                      </div>
                      <span class="text-[8px] font-mono text-zinc-500">{{ el.timestamp }}</span>
                    </div>
                    <p class="text-[10px] text-zinc-400 leading-relaxed">{{ el.description }}</p>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div>
              <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">AI Suggestions</h3>
              <div class="space-y-3">
                <div class="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons text-indigo-400 text-sm">lightbulb</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Pacing Alert</span>
                  </div>
                  <p class="text-xs text-zinc-300">The intro is 3 seconds too long. Cut to the highlight at 0:05 to increase retention.</p>
                  <button (click)="applyAiFix()" class="mt-3 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:underline">Apply Fix</button>
                </div>
                
                <div class="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="material-icons text-zinc-400 text-sm">trending_up</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Viral Hook</span>
                  </div>
                  <p class="text-xs text-zinc-300">"Nobody talks about this..." hook detected. Recommended for TikTok.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Caption Styles</h3>
              <div class="grid grid-cols-2 gap-2">
                @for (style of ['Podcast', 'Influencer', 'Meme', 'Minimal']; track style) {
                  <button (click)="applyCaptionStyle(style)" class="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-bold uppercase tracking-widest hover:border-indigo-500 transition-colors">
                    {{ style }}
                  </button>
                }
              </div>
            </div>
          }
        </aside>
      </div>

      <!-- Timeline -->
      <footer class="h-64 border-t border-zinc-800 bg-zinc-950 flex flex-col flex-shrink-0">
        <div class="h-10 border-b border-zinc-900 flex items-center justify-between px-6">
          <div class="flex items-center gap-4">
            <button (click)="videoService.undo()" class="text-zinc-500 hover:text-white transition-colors">
              <span class="material-icons text-sm">undo</span>
            </button>
            <button (click)="videoService.redo()" class="text-zinc-500 hover:text-white transition-colors">
              <span class="material-icons text-sm">redo</span>
            </button>
            <div class="h-3 w-[1px] bg-zinc-800"></div>
            <button class="text-zinc-500 hover:text-white"><span class="material-icons text-sm">content_cut</span></button>
            <button class="text-zinc-500 hover:text-white"><span class="material-icons text-sm">content_copy</span></button>
          </div>
          <div class="text-[10px] font-mono text-zinc-500">00:00:04 / 00:00:15</div>
          <div class="flex items-center gap-4">
            <span class="material-icons text-sm text-zinc-500">zoom_out</span>
            <div class="w-24 h-1 bg-zinc-800 rounded-full relative">
              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
            </div>
            <span class="material-icons text-sm text-zinc-500">zoom_in</span>
          </div>
        </div>

        <div class="flex-1 overflow-x-auto overflow-y-hidden relative no-scrollbar">
          <!-- Timeline Ruler -->
          <div class="h-6 border-b border-zinc-900 flex items-end px-4 gap-20">
            @for (i of [0,1,2,3,4,5,6,7,8,9]; track i) {
              <div class="text-[8px] font-mono text-zinc-700 pb-1">00:0{{i}}</div>
            }
          </div>

          <!-- Tracks -->
          <div class="p-4 space-y-2 min-w-[2000px]">
            <!-- Story Markers Track (Only visible when storyEdit active) -->
            @if (showStoryElements()) {
              <div class="h-8 relative transition-all duration-700 ease-out opacity-100 translate-y-0"
                   [class.opacity-0]="!showStoryElements()"
                   [class.translate-y-2]="!showStoryElements()">
                <div class="absolute left-0 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-zinc-600 -ml-4 rotate-180 [writing-mode:vertical-lr]">Story</div>
                @for (el of project()?.storyElements; track $index) {
                  <div class="absolute h-8 w-8 -translate-x-1/2 flex flex-col items-center group cursor-pointer" 
                       [style.left.px]="getTimestampOffset(el.timestamp)">
                    <div class="h-4 w-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] border-2 border-white/30 transition-transform group-hover:scale-125 group-hover:border-white"
                         [ngClass]="{
                           'bg-pink-500 shadow-pink-500/20': el.type === 'emotional',
                           'bg-yellow-500 shadow-yellow-500/20': el.type === 'comedic',
                           'bg-blue-500 shadow-blue-500/20': el.type === 'dramatic',
                           'bg-emerald-500 shadow-emerald-500/20': el.type === 'dialogue'
                         }">
                    </div>
                    <!-- Tooltip -->
                    <div class="absolute bottom-full mb-3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[8px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-20 pointer-events-none shadow-2xl">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                          'bg-pink-500': el.type === 'emotional',
                          'bg-yellow-500': el.type === 'comedic',
                          'bg-blue-500': el.type === 'dramatic',
                          'bg-emerald-500': el.type === 'dialogue'
                        }"></span>
                        <span>{{ el.type }}: {{ el.timestamp }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Video Track -->
            <div class="h-12 bg-zinc-900/30 rounded-lg relative border border-zinc-800/50 flex items-center px-1 gap-1">
              <div class="h-10 w-40 bg-indigo-600/20 border border-indigo-500/40 rounded flex items-center px-2 gap-2">
                <img src="https://picsum.photos/seed/clip1/100/100" class="w-6 h-6 rounded object-cover" alt="Clip 1 Thumbnail" referrerpolicy="no-referrer">
                <span class="text-[8px] font-bold uppercase truncate">Intro_Clip.mp4</span>
              </div>
              <div class="h-10 w-64 bg-indigo-600/20 border border-indigo-500/40 rounded flex items-center px-2 gap-2">
                <img src="https://picsum.photos/seed/clip2/100/100" class="w-6 h-6 rounded object-cover" alt="Clip 2 Thumbnail" referrerpolicy="no-referrer">
                <span class="text-[8px] font-bold uppercase truncate">Main_Action.mp4</span>
              </div>
            </div>

            <!-- Captions Track -->
            <div class="h-8 bg-zinc-900/30 rounded-lg relative border border-zinc-800/50 flex items-center px-1 gap-1">
              <div class="h-6 w-20 bg-yellow-400/20 border border-yellow-500/40 rounded flex items-center justify-center">
                <span class="text-[8px] font-bold text-yellow-500 uppercase">Hook</span>
              </div>
              <div class="h-6 w-40 bg-yellow-400/20 border border-yellow-500/40 rounded flex items-center justify-center">
                <span class="text-[8px] font-bold text-yellow-500 uppercase">Subtitle 1</span>
              </div>
            </div>

            <!-- Audio Track -->
            <button class="w-full h-10 bg-zinc-900/30 rounded-lg relative border border-zinc-800/50 flex items-center px-1 gap-1 group cursor-pointer text-left"
                 [class.border-indigo-500]="selectedAudioTrack()?.id === 'bg-music'"
                 (click)="selectAudioTrack('bg-music')">
              <div class="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div class="h-8 w-full bg-emerald-400/10 border border-emerald-500/20 rounded flex items-center px-3 overflow-hidden relative">
                <div class="flex items-center gap-2 z-10">
                  <span class="material-icons text-[10px] text-emerald-500">music_note</span>
                  <span class="text-[8px] font-bold uppercase text-emerald-500/80">Background_Music.mp3</span>
                </div>
                <!-- Waveform Simulation -->
                <div class="absolute inset-0 flex items-center px-2 gap-0.5 opacity-30">
                  @for (j of [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0]; track j) {
                    <div class="w-0.5 bg-emerald-500" [style.height.px]="4 + Math.random() * 12"></div>
                  }
                </div>
                <!-- Fade In/Out Indicators -->
                @if (selectedAudioTrack()?.fadeIn) {
                  <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-emerald-500/20 to-transparent pointer-events-none"></div>
                }
                @if (selectedAudioTrack()?.fadeOut) {
                  <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none"></div>
                }
              </div>
            </button>
          </div>

          <!-- Playhead -->
          <div class="absolute top-0 bottom-0 left-64 w-[2px] bg-white z-10">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
          </div>
        </div>
      </footer>

      <!-- AI Processing Overlay -->
      <div class="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 ease-in-out"
           [class.opacity-0]="!isProcessing()"
           [class.pointer-events-none]="!isProcessing()"
           [class.opacity-100]="isProcessing()"
           [class.pointer-events-auto]="isProcessing()">
        <div class="relative">
          <div class="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center animate-bounce mb-8 shadow-2xl shadow-indigo-500/40">
            <span class="material-icons text-4xl text-white">auto_awesome</span>
          </div>
          <div class="absolute -inset-4 border border-indigo-500/20 rounded-[2rem] animate-pulse"></div>
        </div>
        <h2 class="text-2xl font-black italic uppercase tracking-[0.2em] text-white">{{ processingText() }}</h2>
        <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-4 animate-pulse">Hollywood AI is working its magic...</p>
      </div>

      <!-- Audio Library Modal -->
      @if (showAudioLibrary()) {
        <div class="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div class="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <header class="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-black uppercase italic tracking-widest text-white">Audio Library</h2>
                <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Browse royalty-free viral tracks</p>
              </div>
              <button (click)="showAudioLibrary.set(false)" class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <span class="material-icons">close</span>
              </button>
            </header>

            <div class="p-6 border-b border-zinc-800 space-y-4">
              <div class="relative">
                <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">search</span>
                <input 
                  type="text" 
                  [(ngModel)]="audioSearchQuery"
                  placeholder="Search by genre, mood, or artist..."
                  class="w-full bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
              
              <div class="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Mood:</span>
                  @for (mood of ['happy', 'sad', 'energetic', 'chill', 'dark', 'epic']; track mood) {
                    <button (click)="toggleMood(mood)" 
                            class="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all"
                            [class.bg-indigo-600]="selectedMood() === mood"
                            [class.border-indigo-500]="selectedMood() === mood"
                            [class.bg-zinc-800]="selectedMood() !== mood"
                            [class.border-zinc-700]="selectedMood() !== mood">
                      {{ mood }}
                    </button>
                  }
                </div>
                <div class="h-4 w-[1px] bg-zinc-800 flex-shrink-0"></div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">BPM:</span>
                  <input type="range" min="60" max="180" step="10" 
                         [(ngModel)]="bpmFilter"
                         class="w-24 h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer">
                  <span class="text-[8px] font-mono text-indigo-400">{{ bpmFilter() }}+</span>
                </div>
                @if (selectedMood() || bpmFilter() > 60 || audioSearchQuery()) {
                  <button (click)="clearFilters()" class="ml-auto text-[8px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                    Clear All
                  </button>
                }
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
              @for (track of filteredTracks(); track track.id) {
                <div class="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                  <div class="flex items-center gap-4">
                    <button class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span class="material-icons text-white">play_arrow</span>
                    </button>
                    <div>
                      <h4 class="text-sm font-bold text-white">{{ track.name }}</h4>
                      <div class="flex items-center gap-2">
                        <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{{ track.artist }} • {{ Math.floor(track.duration / 60) }}:{{ (track.duration % 60).toString().padStart(2, '0') }}</p>
                        @if (track.mood) {
                          <span class="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <span class="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{{ track.mood }}</span>
                        }
                        @if (track.bpm) {
                          <span class="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <span class="text-[8px] font-mono text-zinc-500">{{ track.bpm }} BPM</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    @for (tag of track.tags; track tag) {
                      <span class="px-2 py-0.5 rounded-full bg-zinc-900 text-[8px] font-bold uppercase text-zinc-500">{{ tag }}</span>
                    }
                    <button (click)="addTrackFromLibrary(track)" class="ml-4 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-600 transition-all">
                      Add
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center py-12 text-center">
                  <span class="material-icons text-zinc-800 text-6xl mb-4">search_off</span>
                  <p class="text-zinc-500 font-bold uppercase tracking-widest">No tracks found matching your search</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class EditorComponent implements OnInit {
  route = inject(ActivatedRoute);
  videoService = inject(VideoService);
  aiService = inject(AiService);
  adService = inject(AdService);
  
  project = signal<Project | null>(null);
  activeCaption = signal('WATCH THIS...');
  isProcessing = signal(false);
  isBeatSyncing = signal(false);
  processingText = signal('Auto Editing');
  showStoryElements = signal(false);
  showAudioPanel = signal(false);
  showAudioLibrary = signal(false);
  showScriptAssistant = signal(false);
  showTemplateSelector = signal(false);
  showAiGeneratePanel = signal(false);
  
  scriptTopic = signal('');
  scriptKeywords = signal('');
  generatedScript = signal<ScriptResult | null>(null);
  
  aiPrompt = signal('');
  aiTransition = signal('fade');
  aiAnimation = signal('zoom-in');

  promptSuggestions = signal([
    { label: 'Drone Shot', prompt: 'Cinematic drone shot of a misty mountain range at sunrise, 4k, hyper-realistic' },
    { label: 'Cyberpunk', prompt: 'Neon-lit cyberpunk city street at night with rain reflections and flying cars' },
    { label: 'Product Reveal', prompt: 'Minimalist studio lighting revealing a sleek luxury watch on a rotating marble pedestal' },
    { label: 'Travel Vlog', prompt: 'Vibrant and fast-paced montage of a tropical beach with turquoise water and palm trees' },
    { label: 'Retro VHS', prompt: 'Lo-fi retro VHS aesthetic of a 1980s arcade with glitch effects and neon signs' },
    { label: 'Gaming', prompt: 'High-energy gaming setup with RGB lighting and a professional player in intense competition' }
  ]);

  audioSearchQuery = signal('');
  selectedMood = signal<string | null>(null);
  bpmFilter = signal(60);
  selectedAudioTrack = signal<AudioTrack | null>(null);
  
  isDuckingEnabled = signal(false);
  activeEQ = signal('Flat');
  waveformHeights = Array.from({ length: 60 }, () => 15 + Math.random() * 70);
  waveformSelectionStart = signal(15);
  waveformSelectionEnd = signal(45);

  Math = Math;

  filteredTracks = computed(() => {
    const query = this.audioSearchQuery().toLowerCase();
    const mood = this.selectedMood();
    const bpm = this.bpmFilter();
    let tracks = this.videoService.allLibraryTracks();
    
    if (query) {
      tracks = tracks.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.artist.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (mood) {
      tracks = tracks.filter(t => t.mood === mood);
    }
    
    if (bpm > 60) {
      tracks = tracks.filter(t => (t.bpm || 0) >= bpm);
    }
    
    return tracks;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const p = this.videoService.allProjects().find(proj => proj.id === id);
      if (p) {
        this.project.set(p);
        // Initialize mock audio track if not present
        if (!p.audioTracks || p.audioTracks.length === 0) {
          const mockTrack: AudioTrack = {
            id: 'bg-music',
            url: 'https://example.com/music.mp3',
            volume: 0.8,
            fadeIn: 1.5,
            fadeOut: 2.0,
            startTime: 0,
            duration: 15,
            type: 'music'
          };
          this.videoService.updateProject({ audioTracks: [mockTrack] });
        }
      }
    }
  }

  toggleAudioPanel() {
    this.adService.incrementClick(false);
    this.showAudioPanel.set(!this.showAudioPanel());
    if (this.showAudioPanel()) {
      this.showStoryElements.set(false);
      this.selectAudioTrack('bg-music');
    }
  }

  selectAudioTrack(id: string) {
    const track = this.project()?.audioTracks?.find(t => t.id === id);
    if (track) {
      this.selectedAudioTrack.set({ ...track });
    }
  }

  updateAudioVolume(event: Event) {
    const volume = parseFloat((event.target as HTMLInputElement).value);
    const track = this.selectedAudioTrack();
    if (track) {
      const updated = { ...track, volume };
      this.selectedAudioTrack.set(updated);
      this.updateProjectAudio(updated);
    }
  }

  updateAudioFade(event: Event, type: 'in' | 'out') {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    const track = this.selectedAudioTrack();
    if (track) {
      const updated = { ...track, [type === 'in' ? 'fadeIn' : 'fadeOut']: value };
      this.selectedAudioTrack.set(updated);
      this.updateProjectAudio(updated);
    }
  }

  applyMixingPreset(preset: string) {
    this.adService.incrementClick(false);
    const track = this.selectedAudioTrack();
    if (!track) return;

    const updated = { ...track };
    switch (preset) {
      case 'background':
        updated.volume = 0.25;
        updated.fadeIn = 2.0;
        updated.fadeOut = 3.0;
        this.activeEQ.set('Flat');
        this.isDuckingEnabled.set(true);
        break;
      case 'voiceover':
        updated.volume = 0.95;
        updated.fadeIn = 0.3;
        updated.fadeOut = 0.3;
        this.activeEQ.set('Vocal');
        this.isDuckingEnabled.set(true);
        break;
      case 'cinematic':
        updated.volume = 0.8;
        updated.fadeIn = 4.0;
        updated.fadeOut = 4.0;
        this.activeEQ.set('Bass');
        this.isDuckingEnabled.set(false);
        break;
      case 'mute':
        updated.volume = 0;
        break;
    }
    this.selectedAudioTrack.set(updated);
    this.updateProjectAudio(updated);
  }

  toggleMood(mood: string) {
    if (this.selectedMood() === mood) {
      this.selectedMood.set(null);
    } else {
      this.selectedMood.set(mood);
    }
  }

  async goPro() {
    const confirm = window.confirm('Start your 5-day FREE trial of Hollywood Pro? ($5/month after trial)');
    if (confirm) {
      this.videoService.upgradeToPro();
      this.activeCaption.set('PRO ACTIVATED!');
    }
  }

  toggleDucking() {
    this.isDuckingEnabled.set(!this.isDuckingEnabled());
    this.activeCaption.set(this.isDuckingEnabled() ? 'DUCKING ON' : 'DUCKING OFF');
  }

  applyEQ(preset: string) {
    this.activeEQ.set(preset);
    this.activeCaption.set(`EQ: ${preset.toUpperCase()}`);
    // In a real app, this would apply frequency filters
  }

  private updateProjectAudio(updatedTrack: AudioTrack) {
    const tracks = this.project()?.audioTracks || [];
    const newTracks = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
    this.videoService.updateProject({ audioTracks: newTracks });
  }

  clearFilters() {
    this.audioSearchQuery.set('');
    this.selectedMood.set(null);
    this.bpmFilter.set(60);
  }

  async addTrackFromLibrary(track: LibraryTrack) {
    await this.adService.incrementClick();
    const newTrack: AudioTrack = {
      id: 'bg-music', // For now we replace the main track
      url: track.url,
      volume: 0.8,
      fadeIn: 1.5,
      fadeOut: 2.0,
      startTime: 0,
      duration: track.duration,
      type: 'music'
    };
    this.updateProjectAudio(newTrack);
    this.selectedAudioTrack.set(newTrack);
    this.showAudioLibrary.set(false);
    this.activeCaption.set('MUSIC UPDATED!');
  }

  async autoEdit() {
    await this.adService.incrementClick();
    this.isProcessing.set(true);
    this.processingText.set('Analyzing Footage');
    await new Promise(r => setTimeout(r, 1500));
    this.processingText.set('Generating Captions');
    await new Promise(r => setTimeout(r, 1500));
    this.processingText.set('Mixing Audio');
    await new Promise(r => setTimeout(r, 1500));
    this.isProcessing.set(false);
    this.activeCaption.set('VIRAL RESULTS!');
  }

  async generateHooks() {
    await this.adService.incrementClick();
    this.isProcessing.set(true);
    this.processingText.set('Generating Hooks');
    try {
      const hooks = await this.aiService.generateHooks(this.project()?.name || 'viral video');
      if (hooks.length > 0) {
        this.activeCaption.set(hooks[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async openImageGenerator() {
    const promptText = prompt('Describe the image you want to generate:');
    if (promptText) {
      await this.adService.incrementClick();
      this.isProcessing.set(true);
      this.processingText.set('Generating AI Image');
      await new Promise(r => setTimeout(r, 4000));
      this.isProcessing.set(false);
      this.activeCaption.set('IMAGE GENERATED!');
    }
  }

  async saveProject() {
    await this.adService.incrementClick();
    alert('Project saved successfully!');
  }

  async beatSync() {
    await this.adService.incrementClick();
    this.isBeatSyncing.set(true);
    this.isProcessing.set(true);
    this.processingText.set('Beat Syncing');
    await new Promise(r => setTimeout(r, 2500));
    this.isProcessing.set(false);
    this.isBeatSyncing.set(false);
    this.activeCaption.set('SYNCED TO BEAT!');
  }

  getTimestampOffset(timestamp: string): number {
    // Simple mapping: "0:05" -> 5 seconds -> 5 * 80px (approx spacing in ruler)
    // The ruler has gap-20 which is 5rem = 80px. 
    // Each i in [0..9] is 80px apart.
    const parts = timestamp.split(':');
    const seconds = parseInt(parts[parts.length - 1], 10) || 0;
    const minutes = parts.length > 1 ? parseInt(parts[0], 10) : 0;
    const totalSeconds = minutes * 60 + seconds;
    
    // Base offset to align with ruler start (approx 16px padding + some margin)
    return 16 + totalSeconds * 80;
  }

  async storyEdit() {
    await this.adService.incrementClick();
    if (this.project()?.storyElements) {
      this.showStoryElements.set(!this.showStoryElements());
      return;
    }

    this.isProcessing.set(true);
    this.processingText.set('Story Analysis');
    try {
      const elements = await this.aiService.analyzeStory(this.project()?.name || 'viral video');
      this.videoService.updateProject({ storyElements: elements });
      this.showStoryElements.set(true);
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async saveTemplate() {
    await this.adService.incrementClick();
    this.videoService.saveAsTemplate(this.project()?.name + ' Preset');
    alert('Saved to Marketplace!');
  }

  async applyAiFix() {
    await this.adService.incrementClick();
    this.activeCaption.set('FIX APPLIED!');
  }

  async applyCaptionStyle(style: string) {
    await this.adService.incrementClick();
    this.activeCaption.set(`${style.toUpperCase()} STYLE`);
  }

  async generateScript() {
    if (!this.scriptTopic()) return;
    await this.adService.incrementClick();
    this.isProcessing.set(true);
    this.processingText.set('Writing Script');
    try {
      const keywords = this.scriptKeywords().split(',').map(k => k.trim()).filter(k => k);
      const result = await this.aiService.generateScript(this.scriptTopic(), keywords);
      this.generatedScript.set(result);
      this.activeCaption.set('SCRIPT READY!');
    } catch (e) {
      console.error(e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async applyTemplate(template: Template) {
    await this.adService.incrementClick();
    this.isProcessing.set(true);
    this.processingText.set('Applying Template');
    await new Promise(r => setTimeout(r, 2000));
    this.videoService.updateProject({ 
      clips: template.config.clips, 
      captions: template.config.captions,
      thumbnailUrl: template.thumbnailUrl
    });
    this.isProcessing.set(false);
    this.showTemplateSelector.set(false);
    this.activeCaption.set('TEMPLATE APPLIED!');
  }

  async generateAiScene() {
    if (!this.aiPrompt()) return;
    await this.adService.incrementClick();
    this.isProcessing.set(true);
    this.processingText.set('AI Scene Generation');
    try {
      const prompt = `${this.aiPrompt()}. Transition: ${this.aiTransition()}. Text Animation: ${this.aiAnimation()}.`;
      const videoUrl = await this.aiService.generateVideo(prompt, 'Cinematic', '720p', '9:16');
      
      const currentClips = this.project()?.clips || [];
      const newClip = {
        id: 'clip-' + Math.random().toString(36).substr(2, 5),
        url: videoUrl,
        startTime: 0,
        duration: 10,
        type: 'generated' as const
      };
      
      this.videoService.updateProject({ clips: [...currentClips, newClip] });
      this.aiPrompt.set('');
      this.showAiGeneratePanel.set(false);
      this.activeCaption.set('SCENE ADDED!');
    } catch (e) {
      console.error(e);
      alert('Generation failed. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  formatWaveformTime(index: number): string {
    const track = this.selectedAudioTrack();
    if (!track) return '0:00';
    const totalSeconds = track.duration;
    const currentSeconds = (index / this.waveformHeights.length) * totalSeconds;
    const m = Math.floor(currentSeconds / 60);
    const s = Math.floor(currentSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  adjustSelection(side: 'start' | 'end', delta: number) {
    if (side === 'start') {
      const newVal = Math.max(0, Math.min(this.waveformSelectionEnd() - 5, this.waveformSelectionStart() + delta));
      this.waveformSelectionStart.set(newVal);
    } else {
      const newVal = Math.min(this.waveformHeights.length - 1, Math.max(this.waveformSelectionStart() + 5, this.waveformSelectionEnd() + delta));
      this.waveformSelectionEnd.set(newVal);
    }
    this.adService.incrementClick(false);
  }
}
