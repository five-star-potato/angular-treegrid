import { Component, Directive, Input, Output, SimpleChange, OnInit, OnChanges, EventEmitter} from "@angular/core";

export interface PageNumber {
    num: number;
}
/**
 * Page navigation control at the bottom
 */
@Component({
    selector: 'tg-page-nav',
    template: `
		<ul *ngIf="_numPages > 0" class="pagination" style="margin:0">
			<li [class.disabled]="currentPage.num <= 0">
				<a href="javascript:void(0)" (click)="_goPage(0)" aria-label="First">
				<span aria-hidden="true">&laquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage.num <= 0">
				<a href="javascript:void(0)" (click)="_goPrev()" aria-label="Previous">
				<span aria-hidden="true">&lsaquo;</span>
				</a>
			</li>

			<li [class.disabled]="true">
				<a href="javascript:void(0)" aria-label="">
				<span aria-hidden="true">Page {{currentPage.num + 1}} of {{_numPages}}</span>
				</a>
			</li>

			<li></li>

			<li [class.disabled]="currentPage.num >= _numPages - 1">
				<a href="javascript:void(0)" (click)="_goNext()" aria-label="Previous">
				<span aria-hidden="true">&rsaquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage.num >= _numPages - 1">
				<a href="javascript:void(0)" (click)="_goPage(_numPages - 1)" aria-label="Previous">
				<span aria-hidden="true">&raquo;</span>
				</a>
			</li>
		</ul>
    `
})
export class PageNavigator implements OnChanges {
    private _numPages: number;
    @Input() pageSize: number;
    @Input() numRows: number;
    @Input() currentPage: PageNumber;
    // fire the event when the user click, let the parent handle refreshing the page data
    @Output() onNavClick = new EventEmitter<number>();
    @Output() onResetCurrent = new EventEmitter<number>();

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        this.refresh();
        let chng = changes["numRows"];
        let cur = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
    }

    private _goPage(pn: number) {
        this.currentPage.num = pn;
        this.onNavClick.emit(pn);
    }
    private _goPrev() {
        if (this.currentPage.num > 0)
            this.currentPage.num -= 1;
        this.onNavClick.emit(this.currentPage.num);
    }
    private _goNext() {
        if (this.currentPage.num < (this._numPages - 1))
            this.currentPage.num += 1;
        this.onNavClick.emit(this.currentPage.num);
    }
    refresh() {
        if (this.numRows > 0 && this.pageSize > 0) {
            this._numPages = Math.ceil(this.numRows / this.pageSize);
            if (this._numPages > 0)
                if (this.currentPage.num >= this._numPages) { // is somehow current page is no longer valid, move the pointer the last page
                    this.currentPage.num = this._numPages = -1;
                }
        }
    }
}
