import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule} from '@angular/http';

import { AppComponent }  from './app.component';
import { HomeComponent } from './home/home.component';
import { BasicDemoComponent }   	from './demo/basic/basic-demo.component';
import { AjaxLoadDemoComponent }   	from './demo/ajax-load/ajax-load-demo.component';
import { LazyLoadDemoComponent }   	from './demo/lazy-load/lazy-load-demo.component';
import { PipesDemoComponent }   	from './demo/pipes/pipes-demo.component';
import { CustomRenderDemoComponent }from './demo/custom-render/custom-render-demo.component';
import { routing } from './app.routing';
import { DataService } from './shared/data.service';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule, routing ],
  declarations: [ AppComponent, HomeComponent, BasicDemoComponent, AjaxLoadDemoComponent, LazyLoadDemoComponent, PipesDemoComponent, CustomRenderDemoComponent ],
  providers:    [ DataService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }