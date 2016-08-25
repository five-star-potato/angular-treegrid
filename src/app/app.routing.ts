import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }     from './home/home.component';
import { Demo1Component }   from './demo1/demo1.component';
import { Demo2Component }   from './demo2/demo2.component';
import { Demo3Component }   from './demo3/demo3.component';
import { Demo4Component }   from './demo4/demo4.component';

const APP_ROUTES: Routes = [
  { path: '',  pathMatch:'full', redirectTo: '/home' },
  { path: 'home',  component: HomeComponent },
  { path: 'demo1', component: Demo1Component },
  { path: 'demo2', component: Demo2Component },
  { path: 'demo3', component: Demo3Component },
  { path: 'demo4', component: Demo4Component }
];

export const routing = RouterModule.forRoot(APP_ROUTES);