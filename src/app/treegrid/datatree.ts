import { SortDirection, GroupConfig, ColumnOrder, TreeGridDef } from "./treedef";

/***
The idea is to create a representation of the 2D data array in a tree structure, using pk and fk fields.
Each node of the tree contains a pointer to the row. Sorting will happen in the childNodes level, without affecting the
row order in the original 2D array.
***/
export interface DataTreeOption {
    primaryKey?: string;
    foreignKey?: string;
    setIsLoaded?: boolean;
    grouping?: GroupConfig;
}
export interface DataNode {
    row?: any;			// link to the actual data
    index?: number;		// index position data array
    level: number;		// for indentation
    childNodes: any[];	// children
    isOpen?: boolean;	// is the current node open or closed?
    displayCount: number;	// how many nodes are visible under this node (including self)? (for calculating page count; some nodes maybe open; some maybe closed)
    parent: any;		// pointing parent node; need this to propagate the displayCount changes,
    allChildrenLoaded?: boolean;  // I don't think this field is well-defined: if lazyLoad is true, I need to know if the node is loaded or not
}
// temporary data structure for grouping
interface GroupStruct {
    colName: string;
    value?: any;        //
    node?: DataNode;    // used for finding the correct parent
}
export class DataTree {
    rootNode: DataNode;
    private cnt: number;						 // temp var
    private rowCounter: number;			 // temp var for counting rows
    private returnRows: any[]; // store the row indices to the inputData array corresponding to a page

    private _createNewNode(r: any, i:number, parentNode: DataNode, lvl: number = 0):DataNode {
        var n:DataNode = {
            row: r,
            index: i,   // if -1, means this is an artificial entry created for grouping
            level: lvl,
            displayCount: 0, // assuming intially all the nodes are closed
            childNodes: [],
            parent: parentNode,
            allChildrenLoaded: this.options.setIsLoaded
        };
        r.__node = n;
        parentNode.childNodes.push(n);
        return n;
    }    
    private _sortForGrouping(data: any[]): any[] {
        // if grouping is defined (say, c1,c2,c3), we need to sort the data accordingly, using the logic: f(a[c1], b[c1]) || f(a[c2], b[c2]) || f(a[c3], b[c3]) 
        // Probably should implement thenBy ...

        // 1st, collecting the functoids
        let farr: ((a:any, b:any) => number)[] = [];
        let len = this.options.grouping.groupByColumns.length;
        for (let i = 0; i < len; i++) {
            let colOrd: ColumnOrder = this.options.grouping.groupByColumns[i];
            let field = this.treeGridDef.columns[colOrd.columnIndex].dataField;
            let dir = colOrd.sortDirection;
            let v = (a:any, b:any) => { 
                if (colOrd.sortDirection == SortDirection.ASC)
                    return (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0);
                else 
                    return (a[field] > b[field] ? -1 : a[field] < b[field] ? 1 : 0);
            }
            farr.push(v);
        }
        // 2nd the actual comparison is the aggregation result of the functoids
        let func = (a:any, b:any) => {
            let res: number = 0;
            let len = farr.length;
            for (let i = 0; i < len; i++) {
                let f = farr[i];
                res = res || f(a, b);
            }
            return res;
        }
        return data.sort(func);
    }
    constructor(private inputData: any[], private options: DataTreeOption, private treeGridDef?: TreeGridDef) {
        //private pk?: string, private fk?: string, private setIsLoaded:boolean = true) {
        this.rootNode = { childNodes: [], level: -1, displayCount: 0, parent: null, isOpen: true };
        this.cnt = inputData.length;
        if (options.primaryKey && options.foreignKey) {
            // if grouping by pk and fk, ...
            for (let i = 0; i < this.cnt; i++) {
                // load up the "root" nodes first
                if (inputData[i][options.foreignKey] == undefined) { // don't want to assume "0" is "false", i.e. not a valid FK, in some cases, 0 is a valid FK value
                    this._createNewNode(inputData[i], i, this.rootNode);
                }
            }
            // also need to load children (fk) with missing parents (pk)
            for (let i = 0; i < this.cnt; i++) {
                let keyVal:any = inputData[i][options.foreignKey];
                if (keyVal != undefined) {
                    if (inputData.findIndex((x:any) => { return (x[options.primaryKey] == keyVal); }) < 0) {
                        // this entry has fk value, but element of the same pk is not found
                        this._createNewNode(inputData[i], i, this.rootNode);
                    }
                }                
            }            
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
            this.rootNode.childNodes.forEach(n => this._processNode(n));
        }
        else if (options.grouping) {
            this._sortForGrouping(inputData);
            let grps: GroupStruct[] = [];

            // collect the dataField name for the groupings
            options.grouping.groupByColumns.forEach((c: ColumnOrder) => {
                grps.push({ colName: this.treeGridDef.columns[c.columnIndex].dataField });
            });
            let grpLvl:number = grps.length;
            for (let i = 0; i < this.cnt; i++) {
                let parentNode: DataNode;
                for (let j = 0; j < grpLvl; j++) { // j is group  header level
                    let col:string = grps[j].colName;
                    if (inputData[i][col] != grps[j].value) {
                        // Now create a break;
                        parentNode = (j == 0 ? this.rootNode : grps[j - 1].node);
                        grps[j].value = inputData[i][col];
                        let row: Object = {};
                        row[col] = inputData[i][col];
                        grps[j].node = this._createNewNode(row, -1, parentNode, j);
                        // once a new level node is created, all the levels underneath it should be cleared
                        if (j < grpLvl - 1) {
                            grps[j + 1].value = undefined;
                            grps[j + 1].node = undefined;
                        }
                    }
                }
                this._createNewNode(inputData[i], i, grps[grps.length - 1].node, grpLvl);
            }
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
        }
        else {    // no pk and fk, data is flat; just one level
            for (let i = 0; i < this.cnt; i++) {
                this._createNewNode(inputData[i], i, this.rootNode);
            }
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
        }
    }
    // _processNode looks through the input data array to find children to be linked to this node
    private _processNode(node: DataNode) {
        for (let i = 0; i < this.cnt; i++) {
            if (this.inputData[i][this.options.foreignKey] == node.row[this.options.primaryKey]) {
                this._createNewNode(this.inputData[i], i, node, node.level + 1);
            }
        }
        if (node.childNodes.length > 0) {
            node.isOpen = false; // only node with children should have such flag
            node.childNodes.forEach(n => this._processNode(n));
        }
    }
    // recursive sort the children within each node
    sortNode(node: DataNode, field: string, dir: SortDirection) {
        if (node.childNodes.length == 0)
            return;

        node.childNodes.sort((a: any, b: any) => {
            if (dir == SortDirection.ASC)
                return a.row[field] > b.row[field] ? 1 : (a.row[field] < b.row[field] ? -1 : 0);
            else
                return a.row[field] < b.row[field] ? 1 : (a.row[field] > b.row[field] ? -1 : 0);
        });
        node.childNodes.forEach(n => this.sortNode(n, field, dir));
    }
    sortByColumn(field: string, dir: SortDirection) {
        this.sortNode(this.rootNode, field, dir);
    }
    // This is a depth-first traversal to return all rows
    private _traverseAll(node: DataNode) {
        this.returnRows.push(node.row);
        if (node.isOpen)
            node.childNodes.forEach(n => this._traverseAll(n));
    }
    private _traverse(node: DataNode, startRow: number, endRow: number) {
        if (this.rowCounter > endRow)
            return;
        if (this.rowCounter >= startRow && this.rowCounter <= endRow) {
            this.returnRows.push(node.row);
        }
        this.rowCounter++;
        if (node.isOpen)
            node.childNodes.forEach(n => this._traverse(n, startRow, endRow));
    }
/*    private _getDescendantRows(node: DataNode): any[] {
        node.childNodes.forEach(n => {
            this.returnRows.push(n.row);
        });
    }

    getDescendantRows(node: DataNode): any[] {
        this.returnRows = [];
        this._traverseAll(node);
        return this.returnRows;
    }
*/
    getPageData(pageNum: number, pageSize: number): any[] {
        this.rowCounter = 0;
        this.returnRows = [];

        if (pageSize < 0) {
            this.rootNode.childNodes.forEach(n => this._traverseAll(n));
        }
        else {
            this.rootNode.childNodes.forEach(n => this._traverse(n, pageNum * pageSize, (pageNum + 1) * pageSize - 1));
        }
        return this.returnRows;
    }
    // propagate the increase of decrease of changes (deltaVal) up the ancestors path
    private _applyDeltaUpward(node: DataNode, deltaVal: number) {
        if (!node) return;
        node.displayCount += deltaVal;
        this._applyDeltaUpward(node.parent, deltaVal);
    }
    private _subtractDisplayCount(node: DataNode) {
        let oldVal = node.displayCount;
        node.displayCount = 0;
        this._applyDeltaUpward(node.parent, -1 * oldVal);
    }
    private _addDisplayCount(node: DataNode) {
        let sum: number = 0;
        node.childNodes.forEach(c => sum += c.displayCount);
        node.displayCount = node.childNodes.length + sum;
        // since node was closed before (i.e. displayCount = 0), propagate the change upward
        this._applyDeltaUpward(node.parent, node.displayCount);
    }
    // the displayCount keep track of how many descendants (not just children) are on display. So when a branch is open, displayCount of this node goes up; but so does all the ancestors as well
    toggleNode(node: DataNode): number {
        node.isOpen = !(node.isOpen);
        if (node.isOpen)
            this._addDisplayCount(node);
        else
            this._subtractDisplayCount(node);

        return this.rootNode.displayCount;
    }
    // reset the displayCount on each node based on the current status of IsOpen on each node. Useful if we have an operation to open all nodes or close all 
    private _mapReduceDisplayCount(node: DataNode): number {
        node.childNodes.forEach(c => this._mapReduceDisplayCount(c));
        let sum: number = 0;
        node.childNodes.forEach(c => sum += c.displayCount);
        if (node.isOpen)
            node.displayCount = node.childNodes.length + sum;
        else
            node.displayCount = 0;
        return node.displayCount;
    }
    // recalculate displayCount of each node based on isOpen flag
    recountDisplayCount(): number {
        this.cnt = 0;
        return this._mapReduceDisplayCount(this.rootNode);
    }
    // If lazyLoad is enabled, then new rows are fetched from the backend and appended into the data array. We use the start index and end index of this new segment to construct a branch
    addRows(startIndex: number, endIndex: number, parentNode: DataNode) {
        // theoretically the parent ID is in rows[fk]. parentNode is just for convenience
        for (let i = startIndex; i <= endIndex; i++) { // endIndex is inclusive
            let r = this.inputData[i];
            let newNode: DataNode = {
                row: r,
                index: i,
                level: parentNode.level + 1,
                displayCount: 0, // assuming intially all the nodes are closed
                childNodes: [],
                parent: parentNode
            };
            parentNode.childNodes.push(newNode);
            r.__node = newNode;
        }
    }
    private _deleteChildrenNodes(node: DataNode) {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
            this._deleteChildrenNodes(node.childNodes[i]);
        }
        let dataIndex: number = this.inputData.indexOf(node);
        this.inputData.splice(dataIndex, 1);
        node.childNodes = [];
    }
    deleteChildren(node: DataNode) {
        this._deleteChildrenNodes(node);
    }
}