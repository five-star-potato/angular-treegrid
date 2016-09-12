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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/operator/map');
var SimpleDataService = (function () {
    function SimpleDataService(http) {
        this.http = http;
        this.headers = new http_1.Headers();
        this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
        this.headers.append('Access-Control-Allow-Origin', '*');
    }
    SimpleDataService.prototype.get = function (url) {
        return this.http.get(url, { headers: this.headers })
            .map(function (res) { return res.json(); });
        //.catch(this.handleError);
    };
    SimpleDataService.prototype.post = function (url) {
        return this.http.post(url, "", { headers: this.headers })
            .map(function (res) { return res.json(); });
        //.catch(this.handleError);
    };
    /*    post(url: string, body: string = "{}"): Observable<any[]> {
            var params = new URLSearchParams();
            params.set('id', '23');
            return this.http.post(url, params.toString(), { headers: this.headers })
                .map((res: Response) => res.json())
                //.catch(this.handleError);
        }
       */
    SimpleDataService.prototype.handleError = function (error) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        var errMsg = (error.message) ? error.message :
            error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable_1.Observable.throw(errMsg);
    };
    SimpleDataService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)), 
        __metadata('design:paramtypes', [http_1.Http])
    ], SimpleDataService);
    return SimpleDataService;
}());
exports.SimpleDataService = SimpleDataService;
//# sourceMappingURL=simpledata.service.js.map