import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdOverlayComponent } from './components/ad-overlay';
import { PrivacyOverlayComponent } from './components/privacy-overlay';
import { AiAgentComponent } from './components/ai-agent';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, AdOverlayComponent, PrivacyOverlayComponent, AiAgentComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  bgGradient = signal('from-zinc-950 via-zinc-900 to-black');

  ngOnInit() {
    const gradients = [
      'from-indigo-950 via-purple-950 to-pink-950',
      'from-emerald-950 via-teal-950 to-cyan-950',
      'from-rose-950 via-red-950 to-orange-950',
      'from-blue-950 via-indigo-950 to-violet-950',
      'from-amber-950 via-orange-950 to-yellow-950',
      'from-fuchsia-950 via-purple-950 to-indigo-950',
      'from-lime-950 via-emerald-950 to-teal-950'
    ];
    this.bgGradient.set(gradients[Math.floor(Math.random() * gradients.length)]);
  }
}
