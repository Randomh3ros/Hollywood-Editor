import { Routes } from '@angular/router';
import { HomeComponent } from './components/home';
import { CreateComponent } from './components/create';
import { EditorComponent } from './components/editor';
import { ExportComponent } from './components/export';
import { MarketplaceComponent } from './components/marketplace';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: CreateComponent },
  { path: 'editor/:id', component: EditorComponent },
  { path: 'export', component: ExportComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: '**', redirectTo: '' }
];
