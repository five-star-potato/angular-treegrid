import { Component, Directive, Input, Output, SimpleChange, OnInit, OnChanges, EventEmitter} from "@angular/core";

/**
 * Page navigation control at the bottom
 */
@Component({
    selector: 'tg-page-nav',
    template: `
		<ul *ngIf="_numPages > 0" class="pagination" style="margin:0">
			<li [class.disabled]="currentPage <= 0">
				<a href="javascript:void(0)" (click)="_goPage(0)" aria-label="First">
				<span aria-hidden="true">&laquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage <= 0">
				<a href="javascript:void(0)" (click)="_goPrev()" aria-label="Previous">
				<span aria-hidden="true">&lsaquo;</span>
				</a>
			</li>

			<li [class.disabled]="true">
				<a href="javascript:void(0)" aria-label="">
				<span aria-hidden="true">Page {{currentPage + 1}} of {{_numPages}}</span>
				</a>
			</li>

			<li></li>

			<li [class.disabled]="currentPage >= _numPages - 1">
				<a href="javascript:void(0)" (click)="_goNext()" aria-label="Previous">
				<span aria-hidden="true">&rsaquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage >= _numPages - 1">
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
    @Input() currentPage: number;
    // fire the event when the user click, let the parent handle refreshing the page data
    @Output() onNavClick = new EventEmitter<number>();
    @Output() onResetCurrent = new EventEmitter<number>();
    // 2-way binding works but doesn't trigger an OnChange event in treegrid
    @Output() currentPageChange:EventEmitter<number> = new EventEmitter<number>();

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        //this.refresh();
        let chng = changes["numRows"];
        if (chng) { // only deal iwth numRows change for now
            let cur = JSON.stringify(chng.currentValue);
            let prev = JSON.stringify(chng.previousValue);
            if (cur !== prev) {
                this.refresh();
            }
        }
    }

    private _goPage(pn: number) {
        this.currentPage = pn;
        this.currentPageChange.emit(this.currentPage);
        this.onNavClick.emit(pn);
    }
    private _goPrev() {
        if (this.currentPage > 0)
            this.currentPage -= 1;

        this.currentPageChange.emit(this.currentPage);
        this.onNavClick.emit(this.currentPage);
    }
    private _goNext() {
        if (this.currentPage < (this._numPages - 1))
            this.currentPage += 1;

        this.currentPageChange.emit(this.currentPage);
        this.onNavClick.emit(this.currentPage);
    }
    refresh() {
        if (this.numRows > 0 && this.pageSize > 0) {
            this._numPages = Math.ceil(this.numRows / this.pageSize);
            if (this._numPages > 0)
                if (this.currentPage >= this._numPages) { // is somehow current page is no longer valid, move the pointer the last page
                    this.currentPage = this._numPages - 1;
                    this.currentPageChange.emit(this.currentPage);
                    // In this case, the old currentPage is no longer valid; maybe the search has shrunk the number of pages from 2 to 1 and the current Page was pointing to 2. 
                    // this 2-way binding is supposed to work and notify TreeGrid. TreeChange onChanges never seem to fire (not sure it's NG2 bug). But the current flow of logic seems to work.
                    // But there could be a race condition; will treegrid goPage get called before the currentPage is changed?
                }
        }
        else {
            this.currentPage = 0;
            this._numPages = 0;
        }
    }
}
