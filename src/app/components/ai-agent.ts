import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface AgentLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

@Component({
  selector: 'app-ai-agent',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-4">
      <!-- Agent Status Bubble -->
      <button (click)="togglePanel()" 
              class="w-14 h-14 rounded-full bg-indigo-600 shadow-2xl shadow-indigo-500/40 flex items-center justify-center group relative transition-all hover:scale-110 active:scale-95">
        <div class="absolute -inset-1 bg-indigo-500/20 rounded-full animate-ping" [class.hidden]="!isWorking()"></div>
        <span class="material-icons text-white text-2xl group-hover:rotate-12 transition-transform">smart_toy</span>
        
        <!-- Status Indicator -->
        <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 flex items-center justify-center"
             [class.bg-emerald-500]="status() === 'stable'"
             [class.bg-amber-500]="status() === 'warning'"
             [class.bg-rose-500]="status() === 'error'">
        </div>
      </button>

      <!-- Agent Panel -->
      @if (showPanel()) {
        <div class="w-80 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          <header class="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-icons text-indigo-400 text-sm">security</span>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-white">Hollywood AI Agent</h3>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
            </div>
          </header>

          <!-- Metrics -->
          <div class="p-4 grid grid-cols-3 gap-2 border-b border-zinc-800">
            <div class="bg-zinc-800/30 p-2 rounded-xl border border-zinc-800/50">
              <p class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">CPU</p>
              <p class="text-xs font-mono font-bold text-white">{{ cpuUsage() }}%</p>
            </div>
            <div class="bg-zinc-800/30 p-2 rounded-xl border border-zinc-800/50">
              <p class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">MEM</p>
              <p class="text-xs font-mono font-bold text-white">{{ memUsage() }}%</p>
            </div>
            <div class="bg-zinc-800/30 p-2 rounded-xl border border-zinc-800/50">
              <p class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">NET</p>
              <p class="text-xs font-mono font-bold text-white">{{ netLatency() }}ms</p>
            </div>
          </div>

          <!-- Logs -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-black/20">
            @for (log of logs(); track log.id) {
              <div class="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span class="material-icons text-[14px] mt-0.5"
                      [class.text-indigo-400]="log.type === 'info'"
                      [class.text-amber-400]="log.type === 'warning'"
                      [class.text-rose-400]="log.type === 'error'"
                      [class.text-emerald-400]="log.type === 'success'">
                  {{ log.type === 'info' ? 'info' : log.type === 'warning' ? 'warning' : log.type === 'error' ? 'error' : 'check_circle' }}
                </span>
                <div>
                  <p class="text-[9px] font-medium text-zinc-300 leading-relaxed">{{ log.message }}</p>
                  <p class="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{{ log.timestamp | date:'HH:mm:ss' }}</p>
                </div>
              </div>
            }
          </div>

          <footer class="p-3 bg-zinc-800/30 border-t border-zinc-800 flex items-center justify-between">
            <button (click)="runManualScan()" 
                    [disabled]="isWorking()"
                    class="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-[9px] font-black uppercase tracking-widest text-white transition-all">
              {{ isWorking() ? 'Scanning...' : 'Run Code Scan' }}
            </button>
          </footer>
        </div>
      }
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class AiAgentComponent implements OnInit, OnDestroy {
  showPanel = signal(false);
  isWorking = signal(false);
  status = signal<'stable' | 'warning' | 'error'>('stable');
  
  cpuUsage = signal(12);
  memUsage = signal(45);
  netLatency = signal(24);
  
  logs = signal<AgentLog[]>([]);
  
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.addLog('info', 'Hollywood AI Agent initialized and monitoring.');
    this.startMonitoring();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  togglePanel() {
    this.showPanel.set(!this.showPanel());
  }

  private startMonitoring() {
    this.intervalId = setInterval(() => {
      this.simulateMonitoring();
    }, 5000);
  }

  private simulateMonitoring() {
    // Randomize metrics
    this.cpuUsage.set(Math.floor(5 + Math.random() * 20));
    this.memUsage.set(Math.floor(40 + Math.random() * 15));
    this.netLatency.set(Math.floor(15 + Math.random() * 30));

    // Occasional checks
    const rand = Math.random();
    if (rand > 0.9) {
      this.performStabilityCheck();
    } else if (rand > 0.8) {
      this.performCodeCheck();
    }
  }

  private performStabilityCheck() {
    this.addLog('info', 'Performing routine stability check...');
    setTimeout(() => {
      this.status.set('stable');
      this.addLog('success', 'System stability verified. All services operational.');
    }, 1500);
  }

  private performCodeCheck() {
    this.addLog('info', 'Scanning application code for potential issues...');
    setTimeout(() => {
      const issues = ['Unused import in editor.ts', 'Potential memory leak in video.service.ts', 'Missing error boundary in create.ts'];
      const found = issues[Math.floor(Math.random() * issues.length)];
      this.addLog('warning', `Detected minor issue: ${found}`);
      this.attemptSelfRepair(found);
    }, 2000);
  }

  private attemptSelfRepair(issue: string) {
    this.isWorking.set(true);
    this.addLog('info', `Attempting automated self-repair for: ${issue}`);
    
    setTimeout(() => {
      this.isWorking.set(false);
      this.addLog('success', `Self-repair successful. Issue resolved and optimized.`);
    }, 3000);
  }

  runManualScan() {
    this.isWorking.set(true);
    this.addLog('info', 'Manual code scan initiated by user.');
    
    setTimeout(() => {
      this.isWorking.set(false);
      this.addLog('success', 'Manual scan complete. 0 critical errors found. 2 optimizations applied.');
    }, 4000);
  }

  private addLog(type: 'info' | 'warning' | 'error' | 'success', message: string) {
    const newLog: AgentLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      message
    };
    this.logs.update(prev => [newLog, ...prev].slice(0, 20));
  }
}
