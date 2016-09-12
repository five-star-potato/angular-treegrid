import { Injectable, Inject }     from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class SimpleDataService {
    headers: Headers;

    constructor( @Inject(Http) private http: Http) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
        this.headers.append('Access-Control-Allow-Origin', '*');
    }
    get(url: string): Observable<any[]> {
        return this.http.get(url, { headers: this.headers })
            .map((res: Response) => res.json())
            //.catch(this.handleError);
    }
    post(url: string): Observable<any[]> {
        return this.http.post(url, "", { headers: this.headers })
            .map((res: Response) => res.json())
            //.catch(this.handleError);
    }
/*    post(url: string, body: string = "{}"): Observable<any[]> {
        var params = new URLSearchParams();
        params.set('id', '23');
        return this.http.post(url, params.toString(), { headers: this.headers })
            .map((res: Response) => res.json())
            //.catch(this.handleError);
    }
   */
    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
