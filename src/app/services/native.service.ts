import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface NativeShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: string[];
  dialogTitle?: string;
}

export interface PickedFile {
  name: string;
  mimeType: string;
  data: string; // base64
  path?: string;
  webPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NativeService {
  private platformId = inject(PLATFORM_ID);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get isCapacitor(): boolean {
    return this.isBrowser && !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
  }

  get isAndroid(): boolean {
    return this.isCapacitor && (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === 'android';
  }

  async share(options: NativeShareOptions): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      if (this.isCapacitor) {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || 'Share via'
        });
        return true;
      }

      // Web fallback using Web Share API
      if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url
        });
        return true;
      }

      // Final fallback: copy to clipboard
      if (options.url && navigator.clipboard) {
        await navigator.clipboard.writeText(options.url);
        return true;
      }
    } catch (err) {
      console.warn('[NativeService] Share failed:', err);
    }
    return false;
  }

  async hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.isBrowser) return;

    try {
      if (this.isCapacitor) {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const styleMap: Record<string, typeof ImpactStyle[keyof typeof ImpactStyle]> = {
          light: ImpactStyle.Light,
          medium: ImpactStyle.Medium,
          heavy: ImpactStyle.Heavy
        };
        await Haptics.impact({ style: styleMap[style] });
        return;
      }
      // Web fallback: vibration API
      if ('vibrate' in navigator) {
        const durationMap = { light: 30, medium: 50, heavy: 100 };
        navigator.vibrate(durationMap[style]);
      }
    } catch (err) {
      console.warn('[NativeService] Haptic feedback failed:', err);
    }
  }

  async hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this.isBrowser) return;

    try {
      if (this.isCapacitor) {
        const { Haptics, NotificationType } = await import('@capacitor/haptics');
        const typeMap: Record<string, typeof NotificationType[keyof typeof NotificationType]> = {
          success: NotificationType.Success,
          warning: NotificationType.Warning,
          error: NotificationType.Error
        };
        await Haptics.notification({ type: typeMap[type] });
        return;
      }
      if ('vibrate' in navigator) {
        const patternMap = {
          success: [50, 50, 50],
          warning: [100, 50, 100],
          error: [200, 100, 200]
        };
        navigator.vibrate(patternMap[type]);
      }
    } catch (err) {
      console.warn('[NativeService] Haptic notification failed:', err);
    }
  }

  async configureStatusBar(): Promise<void> {
    if (!this.isBrowser || !this.isCapacitor) return;

    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      await StatusBar.setOverlaysWebView({ overlay: true });
    } catch (err) {
      console.warn('[NativeService] StatusBar config failed:', err);
    }
  }

  async pickVideoFile(): Promise<PickedFile | null> {
    if (!this.isBrowser) return null;

    try {
      return await this.pickFileWeb('video/*');
    } catch (err) {
      console.warn('[NativeService] Pick video file failed:', err);
      return null;
    }
  }

  async pickAudioFile(): Promise<PickedFile | null> {
    if (!this.isBrowser) return null;

    try {
      return await this.pickFileWeb('audio/*');
    } catch (err) {
      console.warn('[NativeService] Pick audio file failed:', err);
      return null;
    }
  }

  private pickFileWeb(accept: string): Promise<PickedFile | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          document.body.removeChild(input);
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          document.body.removeChild(input);
          resolve({
            name: file.name,
            mimeType: file.type,
            data: base64,
            webPath: URL.createObjectURL(file)
          });
        };
        reader.onerror = () => {
          document.body.removeChild(input);
          resolve(null);
        };
        reader.readAsDataURL(file);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      input.click();
    });
  }
}
