import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule} from '@angular/http';

import { AppComponent }  from './app.component';
import { HomeComponent } from './home/home.component';
import { Demo1Component } from './demo1/demo1.component';
import { Demo2Component } from './demo2/demo2.component';
import { Demo3Component } from './demo3/demo3.component';
import { Demo4Component } from './demo4/demo4.component';
import { routing } from './app.routing';
import { DataService } from './shared/data.service';

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule, routing ],
  declarations: [ AppComponent, HomeComponent, Demo1Component, Demo2Component, Demo3Component, Demo4Component ],
  providers:    [ DataService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }