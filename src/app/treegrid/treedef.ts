import {  PipeTransform } from "@angular/core";
import { SafeHtml } from  '@angular/platform-browser';

export enum SortDirection {
    ASC,
    DESC
}

export interface ColumnOrder {
    columnIndex?: number;
    //dataField?: string; // TODO: to be implemented
    sortDirection: SortDirection;
}

export enum EditorType {
    MODAL,
    INLINE
}
export interface EditorConfig {
    editorType: EditorType;
}

/****************************
* Some settings related to AJAX. 
*****************************/
export interface AjaxConfig {
    url: string;        
    method?: string;        // POST or GET
    lazyLoad?: boolean;     // Lazy Loading means initially only the top level data rows are loaded. When the user clicks the expand button beside the rows, the corresponding children rows will then be fetched and inserted into the existing arrays of data rows
    childrenIndicatorField?: string;    // This is the data field (returned from the ajax called) to indicate whether this row has children rows that can be fetched. So that the UI knows whether to place an "expand" icon beside the row
    doNotLoad?: boolean;    // if set to true, the treeGrid will not $http intiallay. You need to call loadData() explicitly
}
/****************************
* To match children rows with parent rows, I used the metaphor like database FK and PK
****************************/
export interface TreeHierarchy {
    foreignKeyField: string;
    primaryKeyField: string;
}
// Enable the user to use "Pipes" to transform the data
export interface ColumnTransform {
    pipe: PipeTransform,
    param?: string
}
/**
* To use this treegrid control, you need to provide the TreeGridDef to the TreeGrid component - TreeGridDef contains the column definitions and other options
*/
export interface ColumnDef {
    labelHtml: string;
    dataField: string;
    width?: string;
    className?: string;
    sortable?: boolean;
    filterable?: boolean;
    sortDirection?: SortDirection;
    render?: (data: any, row: any, index: number) => SafeHtml;
    transforms?: ColumnTransform[];
}
export interface FilterConfig {
    url: string;
    method?: string;    // POST or GET
    reloadOnExpand?: boolean; // reloading the children when expanding a node, i.e. don't filter the child nodes when the user expands a tree node.
}
// since GroupingConfig uses column(s) to create tree-like structure, this feature cannot coexists with TreeHierarchy. 
export interface GroupConfig {
    groupByColumns: ColumnOrder[];
    aggregateColumns?: number[];
    requireSort?: boolean;
}
export class TreeGridDef  {
    className: string;
    columns: ColumnDef[] = [];
    data: any[] = [];
    paging: boolean = true;
    sortable: boolean = true;
    pageSize: number = 25; /* make it small for debugging */
    //currentPage: number = 0;
    defaultOrder: ColumnOrder[] = [];
    hierachy: TreeHierarchy;
    ajax: AjaxConfig;
    editor: EditorConfig;
    filter: boolean | FilterConfig = false; 
    grouping: GroupConfig;
}
