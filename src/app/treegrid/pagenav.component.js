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
/**
 * Page navigation control at the bottom
 */
var PageNavigator = (function () {
    function PageNavigator() {
        // fire the event when the user click, let the parent handle refreshing the page data
        this.onNavClick = new core_1.EventEmitter();
        this.onResetCurrent = new core_1.EventEmitter();
    }
    PageNavigator.prototype.ngOnChanges = function (changes) {
        this.refresh();
        var chng = changes["numRows"];
        var cur = JSON.stringify(chng.currentValue);
        var prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
    };
    PageNavigator.prototype._goPage = function (pn) {
        this.currentPage.num = pn;
        this.onNavClick.emit(pn);
    };
    PageNavigator.prototype._goPrev = function () {
        if (this.currentPage.num > 0)
            this.currentPage.num -= 1;
        this.onNavClick.emit(this.currentPage.num);
    };
    PageNavigator.prototype._goNext = function () {
        if (this.currentPage.num < (this._numPages - 1))
            this.currentPage.num += 1;
        this.onNavClick.emit(this.currentPage.num);
    };
    PageNavigator.prototype.refresh = function () {
        if (this.numRows > 0 && this.pageSize > 0) {
            this._numPages = Math.ceil(this.numRows / this.pageSize);
            if (this._numPages > 0)
                if (this.currentPage.num >= this._numPages) {
                    this.currentPage.num = this._numPages = -1;
                }
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PageNavigator.prototype, "pageSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PageNavigator.prototype, "numRows", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PageNavigator.prototype, "currentPage", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], PageNavigator.prototype, "onNavClick", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], PageNavigator.prototype, "onResetCurrent", void 0);
    PageNavigator = __decorate([
        core_1.Component({
            selector: 'tg-page-nav',
            template: "\n\t\t<ul *ngIf=\"_numPages > 0\" class=\"pagination\" style=\"margin:0\">\n\t\t\t<li [class.disabled]=\"currentPage.num <= 0\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"_goPage(0)\" aria-label=\"First\">\n\t\t\t\t<span aria-hidden=\"true\">&laquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li [class.disabled]=\"currentPage.num <= 0\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"_goPrev()\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&lsaquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\n\t\t\t<li [class.disabled]=\"true\">\n\t\t\t\t<a href=\"javascript:void(0)\" aria-label=\"\">\n\t\t\t\t<span aria-hidden=\"true\">Page {{currentPage.num + 1}} of {{_numPages}}</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\n\t\t\t<li></li>\n\n\t\t\t<li [class.disabled]=\"currentPage.num >= _numPages - 1\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"_goNext()\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&rsaquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li [class.disabled]=\"currentPage.num >= _numPages - 1\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"_goPage(_numPages - 1)\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&raquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t</ul>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], PageNavigator);
    return PageNavigator;
}());
exports.PageNavigator = PageNavigator;
//# sourceMappingURL=pagenav.component.js.map