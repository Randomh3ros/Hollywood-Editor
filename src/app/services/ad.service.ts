import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private isAdShowing = signal(false);
  private adCompleted = signal(false);
  private clickCount = signal(0);
  private readonly AD_THRESHOLD = 5; // Show ad every 5 significant clicks

  showAd(): Promise<boolean> {
    this.isAdShowing.set(true);
    this.adCompleted.set(false);
    
    return new Promise((resolve) => {
      // Simulate ad playback
      setTimeout(() => {
        this.isAdShowing.set(false);
        this.adCompleted.set(true);
        resolve(true);
      }, 3000); // 3 second "ad"
    });
  }

  async forceAd() {
    await this.showAd();
  }

  async incrementClick(isSignificant = true) {
    if (!isSignificant) return;
    
    this.clickCount.update(c => c + 1);
    if (this.clickCount() >= this.AD_THRESHOLD) {
      this.clickCount.set(0);
      await this.showAd();
    }
  }

  get isShowing() {
    return this.isAdShowing;
  }
}
