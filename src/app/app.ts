import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdOverlayComponent } from './components/ad-overlay';
import { PrivacyOverlayComponent } from './components/privacy-overlay';
import { AiAgentComponent } from './components/ai-agent';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, AdOverlayComponent, PrivacyOverlayComponent, AiAgentComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
