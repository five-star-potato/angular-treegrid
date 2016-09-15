"use strict";
var treedef_1 = require("./treedef");
var DataTree = (function () {
    function DataTree(inputData, pk, fk, setIsLoaded) {
        var _this = this;
        if (setIsLoaded === void 0) { setIsLoaded = true; }
        this.inputData = inputData;
        this.pk = pk;
        this.fk = fk;
        this.setIsLoaded = setIsLoaded;
        this.rootNode = { childNodes: [], level: -1, displayCount: 0, parent: null, isOpen: true };
        this.cnt = inputData.length;
        if (pk && fk) {
            for (var i = 0; i < this.cnt; i++) {
                if (inputData[i][fk] == undefined) {
                    this._createNewNode(inputData[i], i, this.rootNode);
                }
            }
            // also need to load children (fk) with missing parents (pk)
            var _loop_1 = function(i) {
                var keyVal = inputData[i][fk];
                if (keyVal != undefined) {
                    if (inputData.findIndex(function (x) { return (x[pk] == keyVal); }) < 0) {
                        // this entry has fk value, but element of the same pk is not found
                        this_1._createNewNode(inputData[i], i, this_1.rootNode);
                    }
                }
            };
            var this_1 = this;
            for (var i = 0; i < this.cnt; i++) {
                _loop_1(i);
            }
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
            this.rootNode.childNodes.forEach(function (n) { return _this._processNode(n); });
        }
        else {
            for (var i = 0; i < this.cnt; i++) {
                this._createNewNode(inputData[i], i, this.rootNode);
            }
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
        }
    }
    DataTree.prototype._createNewNode = function (r, i, parentNode, lvl) {
        if (lvl === void 0) { lvl = 0; }
        var n = {
            row: r,
            index: i,
            level: lvl,
            displayCount: 0,
            childNodes: [],
            parent: parentNode,
            isLoaded: this.setIsLoaded
        };
        r.__node = n;
        parentNode.childNodes.push(n);
    };
    DataTree.prototype._processNode = function (node) {
        var _this = this;
        for (var i = 0; i < this.cnt; i++) {
            if (this.inputData[i][this.fk] == node.row[this.pk]) {
                this._createNewNode(this.inputData[i], i, node, node.level + 1);
            }
        }
        if (node.childNodes.length > 0) {
            node.isOpen = false; // only node with children should have such flag
            node.childNodes.forEach(function (n) { return _this._processNode(n); });
        }
    };
    // recursive sort the children within each node
    DataTree.prototype.sortNode = function (node, field, dir) {
        var _this = this;
        if (node.childNodes.length == 0)
            return;
        node.childNodes.sort(function (a, b) {
            if (dir == treedef_1.SortDirection.ASC)
                return a.row[field] > b.row[field] ? 1 : (a.row[field] < b.row[field] ? -1 : 0);
            else
                return a.row[field] < b.row[field] ? 1 : (a.row[field] > b.row[field] ? -1 : 0);
        });
        node.childNodes.forEach(function (n) { return _this.sortNode(n, field, dir); });
    };
    DataTree.prototype.sortByColumn = function (field, dir) {
        this.sortNode(this.rootNode, field, dir);
    };
    // This is a depth-first traversal to return all rows
    DataTree.prototype._traverseAll = function (node) {
        var _this = this;
        this.returnRowsIndices.push(node.index);
        if (node.isOpen)
            node.childNodes.forEach(function (n) { return _this._traverseAll(n); });
    };
    DataTree.prototype._traverse = function (node, startRow, endRow) {
        var _this = this;
        if (this.rowCounter > endRow)
            return;
        if (this.rowCounter >= startRow && this.rowCounter <= endRow) {
            this.returnRowsIndices.push(node.index);
        }
        this.rowCounter++;
        if (node.isOpen)
            node.childNodes.forEach(function (n) { return _this._traverse(n, startRow, endRow); });
    };
    DataTree.prototype.getPageData = function (pageNum, pageSize) {
        var _this = this;
        this.rowCounter = 0;
        this.returnRowsIndices = [];
        if (pageSize < 0) {
            this.rootNode.childNodes.forEach(function (n) { return _this._traverseAll(n); });
        }
        else {
            this.rootNode.childNodes.forEach(function (n) { return _this._traverse(n, pageNum * pageSize, (pageNum + 1) * pageSize - 1); });
        }
        return this.returnRowsIndices;
    };
    // propagate the increase of decrease of changes (deltaVal) up the ancestors path
    DataTree.prototype._applyDeltaUpward = function (node, deltaVal) {
        if (!node)
            return;
        node.displayCount += deltaVal;
        this._applyDeltaUpward(node.parent, deltaVal);
    };
    DataTree.prototype._subtractDisplayCount = function (node) {
        var oldVal = node.displayCount;
        node.displayCount = 0;
        this._applyDeltaUpward(node.parent, -1 * oldVal);
    };
    DataTree.prototype._addDisplayCount = function (node) {
        var sum = 0;
        node.childNodes.forEach(function (c) { return sum += c.displayCount; });
        node.displayCount = node.childNodes.length + sum;
        // since node was closed before (i.e. displayCount = 0), propagate the change upward
        this._applyDeltaUpward(node.parent, node.displayCount);
    };
    // the displayCount keep track of how many descendants (not just children) are on display. So when a branch is open, displayCount of this node goes up; but so does all the ancestors as well
    DataTree.prototype.toggleNode = function (node) {
        node.isOpen = !(node.isOpen);
        if (node.isOpen)
            this._addDisplayCount(node);
        else
            this._subtractDisplayCount(node);
        return this.rootNode.displayCount;
    };
    // reset the displayCount on each node based on the current status of IsOpen on each node. Useful if we have an operation to open all nodes or close all 
    DataTree.prototype._mapReduceDisplayCount = function (node) {
        var _this = this;
        node.childNodes.forEach(function (c) { return _this._mapReduceDisplayCount(c); });
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
        return this._mapReduceDisplayCount(this.rootNode);
    };
    // If lazyLoad is enabled, then new rows are fetched from the backend and appended into the data array. We use the start index and end index of this new segment to construct a branch
    DataTree.prototype.addRows = function (startIndex, endIndex, parentNode) {
        // theoretically the parent ID is in rows[fk]. parentNode is just for convenience
        for (var i = startIndex; i <= endIndex; i++) {
            var r = this.inputData[i];
            var newNode = {
                row: r,
                index: i,
                level: parentNode.level + 1,
                displayCount: 0,
                childNodes: [],
                parent: parentNode
            };
            parentNode.childNodes.push(newNode);
            r.__node = newNode;
        }
    };
    return DataTree;
}());
exports.DataTree = DataTree;
//# sourceMappingURL=datatree.js.map