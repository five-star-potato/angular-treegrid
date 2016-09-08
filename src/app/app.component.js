"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var AppComponent = (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-app',
            template: "\t\n<div class=\"container-fluid\">\n    <div class=\"row\">\n\t\t<div class=\"col-md-2\">\n\t\t\t<ul class=\"nav nav-pills nav-stacked\">\n                <li style=\"text-align:center\"><h4>Basic Operation</h4></li>\n                <li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/home\" class=\"btn btn-default\">Home</a></li>\n\t\t\t\t<li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/demo1\" class=\"btn btn-default\">Simple Table Data</a></li>\n                <li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/demo2\" class=\"btn btn-default\">Loading with Ajax</a></li>\n                <li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/demo3\" class=\"btn btn-default\">Lazy Loading with Ajax</a></li>\n                <li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/demo4\" class=\"btn btn-default\">Formatting with Pipes</a></li>\n                <li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/demo5\" class=\"btn btn-default\">Custom Column Rendering</a></li>\n                <li style=\"text-align:center\"><h4>Editing</h4></li>\n                <li class=\"presentation\" [routerLinkActive]=\"['active']\"><a routerLink=\"/demo6\" class=\"btn btn-default\">Modal Dialog Editor</a></li>\n\n\t\t\t</ul>\n\t\t</div>\n        <div class=\"col-md-10\">\n            <router-outlet></router-outlet>\n        </div>\n    </div>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map