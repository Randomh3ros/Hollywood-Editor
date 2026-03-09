import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface VideoClip {
  id: string;
  url: string;
  startTime: number;
  duration: number;
  type: 'video' | 'image' | 'generated';
}

export interface StoryElement {
  type: 'emotional' | 'comedic' | 'dramatic' | 'dialogue';
  timestamp: string;
  description: string;
}

export interface AudioTrack {
  id: string;
  url: string;
  volume: number; // 0 to 1
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  startTime: number;
  duration: number;
  type: 'music' | 'voiceover' | 'ambient';
}

export interface Project {
  id: string;
  name: string;
  clips: VideoClip[];
  captions: string[];
  audioTracks?: AudioTrack[];
  audioUrl?: string; // Legacy/Primary
  thumbnailUrl?: string;
  createdAt: Date;
  storyElements?: StoryElement[];
}

export interface Template {
  id: string;
  name: string;
  author: string;
  thumbnailUrl: string;
  config: {
    clips: VideoClip[];
    captions: string[];
  };
  favorites: number;
}

export interface LibraryTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number;
  tags: string[];
  mood?: 'happy' | 'sad' | 'energetic' | 'chill' | 'dark' | 'epic';
  bpm?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private projects = signal<Project[]>([]);
  private currentProject = signal<Project | null>(null);
  private templates = signal<Template[]>([]);
  private isPro = signal<boolean>(false);
  private subscriptionExpiry = signal<Date | null>(null);

  private libraryTracks = signal<LibraryTrack[]>([
    { id: 'm1', name: 'Epic Cinematic', artist: 'H. Zimmer Style', url: 'https://example.com/epic.mp3', duration: 120, tags: ['cinematic', 'epic', 'dramatic'], mood: 'epic', bpm: 110 },
    { id: 'm2', name: 'Lo-Fi Chill', artist: 'Lofi Girl', url: 'https://example.com/lofi.mp3', duration: 180, tags: ['chill', 'lofi', 'relaxing'], mood: 'chill', bpm: 85 },
    { id: 'm3', name: 'Upbeat Pop', artist: 'Viral Beats', url: 'https://example.com/pop.mp3', duration: 150, tags: ['happy', 'pop', 'energetic'], mood: 'happy', bpm: 128 },
    { id: 'm4', name: 'Dark Techno', artist: 'Cyberpunk', url: 'https://example.com/techno.mp3', duration: 200, tags: ['dark', 'techno', 'intense'], mood: 'dark', bpm: 140 },
    { id: 'm5', name: 'Corporate Minimal', artist: 'BizAudio', url: 'https://example.com/minimal.mp3', duration: 90, tags: ['clean', 'minimal', 'business'], mood: 'chill', bpm: 100 },
    { id: 'm6', name: 'Aggressive Phonk', artist: 'Drift King', url: 'https://example.com/phonk.mp3', duration: 130, tags: ['aggressive', 'phonk', 'drift'], mood: 'energetic', bpm: 150 },
    { id: 'm7', name: 'Sad Piano', artist: 'Melancholy', url: 'https://example.com/sad.mp3', duration: 110, tags: ['sad', 'piano', 'emotional'], mood: 'sad', bpm: 70 },
  ]);

  private history: Project[] = [];
  private redoStack: Project[] = [];
  private readonly MAX_HISTORY = 50;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.loadFromStorage();
    
    // If no projects loaded, set defaults
    if (this.projects().length === 0) {
      this.projects.set([
        {
          id: '1',
          name: 'Motivational Success',
          clips: [],
          captions: [],
          createdAt: new Date(),
          thumbnailUrl: 'https://picsum.photos/seed/success/400/225'
        },
        {
          id: '2',
          name: 'Podcast Highlight #4',
          clips: [],
          captions: [],
          createdAt: new Date(),
          thumbnailUrl: 'https://picsum.photos/seed/podcast/400/225'
        }
      ]);
    }

    this.templates.set([
      {
        id: 't1',
        name: 'Viral Podcast Style',
        author: 'AlexEdit',
        thumbnailUrl: 'https://picsum.photos/seed/t1/400/225',
        favorites: 1240,
        config: { clips: [], captions: [] }
      },
      {
        id: 't2',
        name: 'Cinematic Travel',
        author: 'GlobeTrotter',
        thumbnailUrl: 'https://picsum.photos/seed/t2/400/225',
        favorites: 850,
        config: { clips: [], captions: [] }
      },
      {
        id: 't3',
        name: 'Gaming Montage Pro',
        author: 'NoobMaster69',
        thumbnailUrl: 'https://picsum.photos/seed/t3/400/225',
        favorites: 3200,
        config: { clips: [], captions: [] }
      }
    ]);
  }

  get allProjects() { return this.projects; }
  get activeProject() { return this.currentProject; }
  get allTemplates() { return this.templates; }
  get allLibraryTracks() { return this.libraryTracks; }
  get proStatus() { return this.isPro; }
  get subExpiry() { return this.subscriptionExpiry; }

  upgradeToPro() {
    this.isPro.set(true);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 5); // 5 day trial
    this.subscriptionExpiry.set(expiry);
    this.autoSave();
  }

  setCurrentProject(project: Project | null) {
    this.currentProject.set(project);
    if (project) {
      this.history = [JSON.parse(JSON.stringify(project))];
      this.redoStack = [];
    }
  }

  createProject(name: string) {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      clips: [],
      captions: [],
      createdAt: new Date()
    };
    this.projects.update(p => [newProject, ...p]);
    this.setCurrentProject(newProject);
    this.autoSave();
    return newProject;
  }

  updateProject(updated: Partial<Project>, skipHistory = false) {
    const current = this.currentProject();
    if (current) {
      if (!skipHistory) {
        this.history.push(JSON.parse(JSON.stringify(current)));
        if (this.history.length > this.MAX_HISTORY) this.history.shift();
        this.redoStack = [];
      }

      const newProject = { ...current, ...updated };
      this.currentProject.set(newProject);
      this.projects.update(projects => 
        projects.map(p => p.id === current.id ? newProject : p)
      );
      this.autoSave();
    }
  }

  undo() {
    if (this.history.length > 1) {
      const current = this.currentProject();
      if (current) {
        this.redoStack.push(JSON.parse(JSON.stringify(current)));
      }
      const previous = this.history.pop()!;
      this.updateProject(previous, true);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const current = this.currentProject();
      if (current) {
        this.history.push(JSON.parse(JSON.stringify(current)));
      }
      const next = this.redoStack.pop()!;
      this.updateProject(next, true);
    }
  }

  private autoSave() {
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem('hollywood_projects', JSON.stringify(this.projects()));
      localStorage.setItem('hollywood_is_pro', JSON.stringify(this.isPro()));
      if (this.subscriptionExpiry()) {
        localStorage.setItem('hollywood_sub_expiry', this.subscriptionExpiry()!.toISOString());
      }
      const current = this.currentProject();
      if (current) {
        localStorage.setItem('hollywood_current_project_id', current.id);
      }
    } catch (e) {
      console.warn('localStorage not available for saving', e);
    }
  }

  private loadFromStorage() {
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('hollywood_projects');
      if (saved) {
        this.projects.set(JSON.parse(saved));
      }
      const isPro = localStorage.getItem('hollywood_is_pro');
      if (isPro) {
        this.isPro.set(JSON.parse(isPro));
      }
      const expiry = localStorage.getItem('hollywood_sub_expiry');
      if (expiry) {
        this.subscriptionExpiry.set(new Date(expiry));
      }
    } catch (e) {
      console.error('Failed to load projects from storage', e);
    }
  }

  saveAsTemplate(name: string) {
    const current = this.currentProject();
    if (current) {
      const newTemplate: Template = {
        id: 't' + Math.random().toString(36).substr(2, 5),
        name,
        author: 'Me',
        thumbnailUrl: current.thumbnailUrl || 'https://picsum.photos/seed/temp/400/225',
        favorites: 0,
        config: { clips: current.clips, captions: current.captions }
      };
      this.templates.update(t => [newTemplate, ...t]);
    }
  }
}
