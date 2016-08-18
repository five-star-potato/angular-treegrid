/***
The idea is to create a representation of the 2D data array in a tree structure, using pk and fk fields.
Each node of the tree contains a pointer to the row. Sorting will happen in the childNodes level, without affecting the
row order in the original 2D array.
***/
export enum SortDirection {
    ASC,
    DESC
}

export interface DataNode {
    row?: any;			// link to the actual data
    index?: number;		// index position data array
    level: number;		// for indentation
    childNodes: any[];	// children
    isOpen?: boolean;	// is the current node open or closed?
    parent?: DataNode;	// link to the parent node
    nodeCount: number;	// how many nodes are visible under this node (including self)? (for calculating page count; some nodes maybe open; some maybe closed)
}
export class DataTree {
    rootNode: DataNode;
    cnt: number;
    private rowCounter: number;
    private returnRowsIndices: number[];

    constructor(private inputData: any[], private pk: string, private fk: string) {
        this.rootNode = { childNodes: [], level: -1, nodeCount: 0 };
        this.cnt = inputData.length;
        for (let i = 0; i < this.cnt; i++) {
            if (inputData[i][fk] == null) {
                let newNode: DataNode = {
                    row: inputData[i],
                    index: i,
                    level: 0,
					nodeCount: 1, // assuming intially all the nodes are closed
                    childNodes: []
                };
                this.rootNode.childNodes.push(newNode);
                inputData[i].__node = newNode;
            }
        }
        this.rootNode.childNodes.forEach(n => this.processNode(n));
    }
    private processNode(node: DataNode) {
        for (let i = 0; i < this.cnt; i++) {
            if (this.inputData[i][this.fk] == node.row[this.pk]) {
                let newNode: DataNode = {
                    row: this.inputData[i],
                    index: i,
                    level: node.level + 1,
                    nodeCount: 0, // assuming intially all the nodes are closed
                    childNodes: []
                };
                node.childNodes.push(newNode);
                this.inputData[i].__node = newNode;
            }
        }
        if (node.childNodes.length > 0) {
            node.isOpen = false; // only node with children should have such flag
            node.childNodes.forEach(n => this.processNode(n));
        }
    }
    private sort(node: DataNode, field: string, dir: SortDirection) {
        if (node.childNodes.length == 0)
            return;

        node.childNodes.sort((a: any, b: any) => {
            if (dir == SortDirection.ASC)
                return a.row[field] > b.row[field] ? 1 : (a.row[field] < b.row[field] ? -1 : 0);
            else
                return a.row[field] < b.row[field] ? 1 : (a.row[field] > b.row[field] ? -1 : 0);
        });
        node.childNodes.forEach(n => this.sort(n, field, dir));
    }
    sortColumn(field: string, dir: SortDirection) {
        this.sort(this.rootNode, field, dir);
    }
	// This is a depth-first traversal to return all rows
    private traverseAll(node: DataNode) {
        this.returnRowsIndices.push(node.index);
        if (node.isOpen)
			node.childNodes.forEach(n => this.traverseAll(n));
    }
    private traverse(node: DataNode, startRow: number, endRow: number) {
        if (this.rowCounter > endRow)
            return;
        if (this.rowCounter >= startRow && this.rowCounter <= endRow) {
            this.returnRowsIndices.push(node.index);
        }
        this.rowCounter++;
        if (node.isOpen)
			node.childNodes.forEach(n => this.traverse(n, startRow, endRow));
    }
    getPageData(pageNum: number, pageSize: number): any[] {
        this.rowCounter = 0;
        this.returnRowsIndices = [];

        if (pageSize < 0) {
			this.rootNode.childNodes.forEach(n => this.traverseAll(n));
        }
        else {
            this.rootNode.childNodes.forEach(n => this.traverse(n, pageNum * pageSize, (pageNum + 1) * pageSize - 1));
        }
        return this.returnRowsIndices;
    }
}