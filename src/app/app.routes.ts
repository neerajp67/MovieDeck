import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ListComponent } from './components/list/list.component';
import { DetailComponent } from './components/detail/detail.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'movies', component: ListComponent },
  { path: 'shows', component: ListComponent },
  { path: 'people', component: ListComponent },
  { path: 'movie/:id', component: DetailComponent, data: { mediaType: 'movie' } },
  { path: 'tv/:id', component: DetailComponent, data: { mediaType: 'tv' } },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
