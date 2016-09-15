import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
	stripHTML(val: string, replaceWith:string = " "):string { 
    	return val.replace(/<\/?[^>]+(>|$)/g, replaceWith); 
	}
}