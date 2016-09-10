import { Component, Directive, OnInit, ViewChild } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'my-app',
    template: `	
<div class="container-fluid">
    <div class="row">
		<div class="col-md-2">
			<ul class="nav nav-pills nav-stacked">
                <li class="presentation" [routerLinkActive]="['active']"><a routerLink="/home" class="btn btn-default">Home</a></li>
				<li class="presentation" [routerLinkActive]="['active']"><a routerLink="/demo1" class="btn btn-default">Simple Table Setup</a></li>
                <li class="presentation" [routerLinkActive]="['active']"><a routerLink="/demo2" class="btn btn-default">Loading with Ajax</a></li>
                <li class="presentation" [routerLinkActive]="['active']"><a routerLink="/demo3" class="btn btn-default">Lazy Loading with Ajax</a></li>
                <li class="presentation" [routerLinkActive]="['active']"><a routerLink="/demo4" class="btn btn-default">Formatting with Pipes</a></li>
                <li class="presentation" [routerLinkActive]="['active']"><a routerLink="/demo5" class="btn btn-default">Custom Column Rendering</a></li>
                <li class="presentation" [routerLinkActive]="['active']"><a routerLink="/demo6" class="btn btn-default">Modal Dialog Editor</a></li>

			</ul>
		</div>
        <div class="col-md-10">
            <router-outlet></router-outlet>
        </div>
    </div>
</div>
`    
})
export class AppComponent {}