import { SortDirection} from "./treedef";

/***
The idea is to create a representation of the 2D data array in a tree structure, using pk and fk fields.
Each node of the tree contains a pointer to the row. Sorting will happen in the childNodes level, without affecting the
row order in the original 2D array.
***/
export interface DataNode {
    row?: any;			// link to the actual data
    index?: number;		// index position data array
    level: number;		// for indentation
    childNodes: any[];	// children
    isOpen?: boolean;	// is the current node open or closed?
    displayCount: number;	// how many nodes are visible under this node (including self)? (for calculating page count; some nodes maybe open; some maybe closed)
    parent: any;		// pointing parent node; need this to propagate the displayCount changes,
    isLoaded?: boolean;  // if lazyLoad is true, I need to know if the node is loaded or not
}
export class DataTree {
    rootNode: DataNode;
    private cnt: number;						 // temp var
    private rowCounter: number;			 // temp var for counting rows
    private returnRowsIndices: number[]; // store the row indices to the inputData array corresponding to a page

    private _createNewNode(r: any, i:number, parentNode: DataNode, lvl: number = 0) {
        var n:DataNode = {
            row: r,
            index: i,
            level: lvl,
            displayCount: 0, // assuming intially all the nodes are closed
            childNodes: [],
            parent: parentNode,
            isLoaded: this.setIsLoaded
        };
        r.__node = n;
        parentNode.childNodes.push(n);
    }    
    constructor(private inputData: any[], private pk?: string, private fk?: string, private setIsLoaded:boolean = true) {
        this.rootNode = { childNodes: [], level: -1, displayCount: 0, parent: null, isOpen: true };
        this.cnt = inputData.length;
        if (pk && fk) {
            for (let i = 0; i < this.cnt; i++) {
                if (inputData[i][fk] == undefined) { // don't want to assume "0" is "false", i.e. not a valid FK, in some cases, 0 is a valid FK value
                    this._createNewNode(inputData[i], i, this.rootNode);
                }
            }
            // also need to load children (fk) with missing parents (pk)
            for (let i = 0; i < this.cnt; i++) {
                let keyVal:any = inputData[i][fk];
                if (keyVal != undefined) {
                    if (inputData.findIndex((x:any) => { return (x[pk] == keyVal); }) < 0) {
                        // this entry has fk value, but element of the same pk is not found
                        this._createNewNode(inputData[i], i, this.rootNode);
                    }
                }                
            }            
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
            this.rootNode.childNodes.forEach(n => this._processNode(n));
        }
        else {    // no pk and fk, data is flat; just one level
            for (let i = 0; i < this.cnt; i++) {
                this._createNewNode(inputData[i], i, this.rootNode);
            }
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
        }
    }
    
    private _processNode(node: DataNode) {
        for (let i = 0; i < this.cnt; i++) {
            if (this.inputData[i][this.fk] == node.row[this.pk]) {
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
        this.returnRowsIndices.push(node.index);
        if (node.isOpen)
            node.childNodes.forEach(n => this._traverseAll(n));
    }
    private _traverse(node: DataNode, startRow: number, endRow: number) {
        if (this.rowCounter > endRow)
            return;
        if (this.rowCounter >= startRow && this.rowCounter <= endRow) {
            this.returnRowsIndices.push(node.index);
        }
        this.rowCounter++;
        if (node.isOpen)
            node.childNodes.forEach(n => this._traverse(n, startRow, endRow));
    }
    getPageData(pageNum: number, pageSize: number): any[] {
        this.rowCounter = 0;
        this.returnRowsIndices = [];

        if (pageSize < 0) {
            this.rootNode.childNodes.forEach(n => this._traverseAll(n));
        }
        else {
            this.rootNode.childNodes.forEach(n => this._traverse(n, pageNum * pageSize, (pageNum + 1) * pageSize - 1));
        }
        return this.returnRowsIndices;
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
}