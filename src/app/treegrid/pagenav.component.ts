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
		<ul class="pagination" style="margin:0">
			<li [class.disabled]="currentPage.num <= 0">
				<a href="javascript:void(0)" (click)="goPage(0)" aria-label="First">
				<span aria-hidden="true">&laquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage.num <= 0">
				<a href="javascript:void(0)" (click)="goPrev()" aria-label="Previous">
				<span aria-hidden="true">&lsaquo;</span>
				</a>
			</li>

			<li [class.disabled]="true">
				<a href="javascript:void(0)" aria-label="">
				<span aria-hidden="true">Page {{currentPage.num + 1}} of {{numPages}}</span>
				</a>
			</li>

			<li></li>

			<li [class.disabled]="currentPage.num >= numPages - 1">
				<a href="javascript:void(0)" (click)="goNext()" aria-label="Previous">
				<span aria-hidden="true">&rsaquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage.num >= numPages - 1">
				<a href="javascript:void(0)" (click)="goPage(numPages - 1)" aria-label="Previous">
				<span aria-hidden="true">&raquo;</span>
				</a>
			</li>
		</ul>
    `
})
export class PageNavigator implements OnChanges {
    numPages: number;
    @Input() pageSize: number;
    @Input() numRows: number;
    @Input() currentPage: PageNumber;
    // fire the event when the user click, let the parent handle refreshing the page data
    @Output() onNavClick = new EventEmitter<number>();
    @Output() onResetCurrent = new EventEmitter<number>();

    refresh() {
        this.numPages = Math.ceil(this.numRows / this.pageSize);
        if (this.numPages > 0)
            if (this.currentPage.num >= this.numPages) { // is somehow current page is no longer valid, move the pointer the last page
                this.currentPage.num = this.numPages = -1;
            }
    }
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        this.refresh();
        let chng = changes["numRows"];
        let cur = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
    }

    goPage(pn: number) {
        this.currentPage.num = pn;
        this.onNavClick.emit(pn);
    }
    goPrev() {
        if (this.currentPage.num > 0)
            this.currentPage.num -= 1;
        this.onNavClick.emit(this.currentPage.num);
    }
    goNext() {
        if (this.currentPage.num < (this.numPages - 1))
            this.currentPage.num += 1;
        this.onNavClick.emit(this.currentPage.num);
    }
}
