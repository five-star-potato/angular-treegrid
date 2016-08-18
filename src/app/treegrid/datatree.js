"use strict";
/***
The idea is to create a representation of the 2D data array in a tree structure, using pk and fk fields.
Each node of the tree contains a pointer to the row. Sorting will happen in the childNodes level, without affecting the
row order in the original 2D array.
***/
(function (SortDirection) {
    SortDirection[SortDirection["ASC"] = 0] = "ASC";
    SortDirection[SortDirection["DESC"] = 1] = "DESC";
})(exports.SortDirection || (exports.SortDirection = {}));
var SortDirection = exports.SortDirection;
var DataTree = (function () {
    function DataTree(inputData, pk, fk) {
        var _this = this;
        this.inputData = inputData;
        this.pk = pk;
        this.fk = fk;
        this.rootNode = { childNodes: [], level: -1, displayCount: 0, parent: null, isOpen: true };
        this.cnt = inputData.length;
        for (var i = 0; i < this.cnt; i++) {
            if (inputData[i][fk] == null) {
                var newNode = {
                    row: inputData[i],
                    index: i,
                    level: 0,
                    displayCount: 0,
                    childNodes: [],
                    parent: this.rootNode
                };
                this.rootNode.childNodes.push(newNode);
                inputData[i].__node = newNode;
            }
        }
        this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
        this.rootNode.childNodes.forEach(function (n) { return _this.processNode(n); });
    }
    DataTree.prototype.processNode = function (node) {
        var _this = this;
        for (var i = 0; i < this.cnt; i++) {
            if (this.inputData[i][this.fk] == node.row[this.pk]) {
                var newNode = {
                    row: this.inputData[i],
                    index: i,
                    level: node.level + 1,
                    displayCount: 0,
                    childNodes: [],
                    parent: node
                };
                node.childNodes.push(newNode);
                this.inputData[i].__node = newNode;
            }
        }
        if (node.childNodes.length > 0) {
            node.isOpen = false; // only node with children should have such flag
            node.childNodes.forEach(function (n) { return _this.processNode(n); });
        }
    };
    DataTree.prototype.sort = function (node, field, dir) {
        var _this = this;
        if (node.childNodes.length == 0)
            return;
        node.childNodes.sort(function (a, b) {
            if (dir == SortDirection.ASC)
                return a.row[field] > b.row[field] ? 1 : (a.row[field] < b.row[field] ? -1 : 0);
            else
                return a.row[field] < b.row[field] ? 1 : (a.row[field] > b.row[field] ? -1 : 0);
        });
        node.childNodes.forEach(function (n) { return _this.sort(n, field, dir); });
    };
    DataTree.prototype.sortColumn = function (field, dir) {
        this.sort(this.rootNode, field, dir);
    };
    // This is a depth-first traversal to return all rows
    DataTree.prototype.traverseAll = function (node) {
        var _this = this;
        this.returnRowsIndices.push(node.index);
        if (node.isOpen)
            node.childNodes.forEach(function (n) { return _this.traverseAll(n); });
    };
    DataTree.prototype.traverse = function (node, startRow, endRow) {
        var _this = this;
        if (this.rowCounter > endRow)
            return;
        if (this.rowCounter >= startRow && this.rowCounter <= endRow) {
            this.returnRowsIndices.push(node.index);
        }
        this.rowCounter++;
        if (node.isOpen)
            node.childNodes.forEach(function (n) { return _this.traverse(n, startRow, endRow); });
    };
    DataTree.prototype.getPageData = function (pageNum, pageSize) {
        var _this = this;
        this.rowCounter = 0;
        this.returnRowsIndices = [];
        if (pageSize < 0) {
            this.rootNode.childNodes.forEach(function (n) { return _this.traverseAll(n); });
        }
        else {
            this.rootNode.childNodes.forEach(function (n) { return _this.traverse(n, pageNum * pageSize, (pageNum + 1) * pageSize - 1); });
        }
        return this.returnRowsIndices;
    };
    DataTree.prototype.applyDeltaUpward = function (node, deltaVal) {
        if (!node)
            return;
        node.displayCount += deltaVal;
        this.applyDeltaUpward(node.parent, deltaVal);
    };
    DataTree.prototype.subtractDisplayCount = function (node) {
        var oldVal = node.displayCount;
        node.displayCount = 0;
        this.applyDeltaUpward(node.parent, -1 * oldVal);
    };
    DataTree.prototype.addDisplayCount = function (node) {
        var sum = 0;
        node.childNodes.forEach(function (c) { return sum += c.displayCount; });
        node.displayCount = node.childNodes.length + sum;
        // since node was closed before (i.e. displayCount = 0), propagate the change upward
        this.applyDeltaUpward(node.parent, node.displayCount);
    };
    DataTree.prototype.toggleNode = function (node) {
        node.isOpen = !(node.isOpen);
        if (node.isOpen)
            this.addDisplayCount(node);
        else
            this.subtractDisplayCount(node);
        return this.rootNode.displayCount;
    };
    // reset the displayCount on each node based on the current status of IsOpen on each node. Useful if we have an operation to open all nodes or close all 
    DataTree.prototype.mapReduceDisplayCount = function (node) {
        var _this = this;
        node.childNodes.forEach(function (c) { return _this.mapReduceDisplayCount(c); });
        var sum = 0;
        node.childNodes.forEach(function (c) { return sum += c.displayCount; });
        if (node.isOpen)
            node.displayCount = node.childNodes.length + sum;
        else
            node.displayCount = 0;
        return node.displayCount;
    };
    // recalculate displayCount of each node based on isOpen flag
    DataTree.prototype.recountDisplayCount = function () {
        this.cnt = 0;
        return this.mapReduceDisplayCount(this.rootNode);
    };
    return DataTree;
}());
exports.DataTree = DataTree;
//# sourceMappingURL=datatree.js.map