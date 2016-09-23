"use strict";
var treedef_1 = require("./treedef");
var DataTree = (function () {
    function DataTree(inputData, options, treeGridDef) {
        var _this = this;
        this.inputData = inputData;
        this.options = options;
        this.treeGridDef = treeGridDef;
        //private pk?: string, private fk?: string, private setIsLoaded:boolean = true) {
        this.rootNode = { childNodes: [], level: -1, displayCount: 0, parent: null, isOpen: true };
        this.cnt = inputData.length;
        if (options.primaryKey && options.foreignKey) {
            // if grouping by pk and fk, ...
            for (var i = 0; i < this.cnt; i++) {
                // load up the "root" nodes first
                if (inputData[i][options.foreignKey] == undefined) {
                    this._createNewNode(inputData[i], i, this.rootNode);
                }
            }
            // also need to load children (fk) with missing parents (pk)
            var _loop_1 = function(i) {
                var keyVal = inputData[i][options.foreignKey];
                if (keyVal != undefined) {
                    if (inputData.findIndex(function (x) { return (x[options.primaryKey] == keyVal); }) < 0) {
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
        else if (options.grouping) {
            this._sortForGrouping(inputData);
            var grps_1 = [];
            // collect the dataField name for the groupings
            options.grouping.groupByColumns.forEach(function (c) {
                grps_1.push({ colName: _this.treeGridDef.columns[c.columnIndex].dataField });
            });
            var grpLvl = grps_1.length;
            for (var i = 0; i < this.cnt; i++) {
                var parentNode = void 0;
                for (var j = 0; j < grpLvl; j++) {
                    var col = grps_1[j].colName;
                    if (inputData[i][col] != grps_1[j].value) {
                        // Now create a break;
                        parentNode = (j == 0 ? this.rootNode : grps_1[j - 1].node);
                        grps_1[j].value = inputData[i][col];
                        var row = {};
                        row[col] = inputData[i][col];
                        grps_1[j].node = this._createNewNode(row, -1, parentNode, j);
                        // once a new level node is created, all the levels underneath it should be cleared
                        if (j < grpLvl - 1) {
                            grps_1[j + 1].value = undefined;
                            grps_1[j + 1].node = undefined;
                        }
                    }
                }
                this._createNewNode(inputData[i], i, grps_1[grps_1.length - 1].node, grpLvl);
            }
            this.rootNode.displayCount = this.rootNode.childNodes.length; // assuming initially only the root childs are displayed.
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
            allChildrenLoaded: this.options.setIsLoaded
        };
        r.__node = n;
        parentNode.childNodes.push(n);
        return n;
    };
    DataTree.prototype._sortForGrouping = function (data) {
        // if grouping is defined (say, c1,c2,c3), we need to sort the data accordingly, using the logic: f(a[c1], b[c1]) || f(a[c2], b[c2]) || f(a[c3], b[c3]) 
        // Probably should implement thenBy ...
        // 1st, collecting the functoids
        var farr = [];
        var len = this.options.grouping.groupByColumns.length;
        var _loop_2 = function(i) {
            var colOrd = this_2.options.grouping.groupByColumns[i];
            var field = this_2.treeGridDef.columns[colOrd.columnIndex].dataField;
            var dir = colOrd.sortDirection;
            var v = function (a, b) {
                if (colOrd.sortDirection == treedef_1.SortDirection.ASC)
                    return (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0);
                else
                    return (a[field] > b[field] ? -1 : a[field] < b[field] ? 1 : 0);
            };
            farr.push(v);
        };
        var this_2 = this;
        for (var i = 0; i < len; i++) {
            _loop_2(i);
        }
        // 2nd the actual comparison is the aggregation result of the functoids
        var func = function (a, b) {
            var res = 0;
            var len = farr.length;
            for (var i = 0; i < len; i++) {
                var f = farr[i];
                res = res || f(a, b);
            }
            return res;
        };
        return data.sort(func);
    };
    // _processNode looks through the input data array to find children to be linked to this node
    DataTree.prototype._processNode = function (node) {
        var _this = this;
        for (var i = 0; i < this.cnt; i++) {
            if (this.inputData[i][this.options.foreignKey] == node.row[this.options.primaryKey]) {
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
        this.returnRows.push(node.row);
        if (node.isOpen)
            node.childNodes.forEach(function (n) { return _this._traverseAll(n); });
    };
    DataTree.prototype._traverse = function (node, startRow, endRow) {
        var _this = this;
        if (this.rowCounter > endRow)
            return;
        if (this.rowCounter >= startRow && this.rowCounter <= endRow) {
            this.returnRows.push(node.row);
        }
        this.rowCounter++;
        if (node.isOpen)
            node.childNodes.forEach(function (n) { return _this._traverse(n, startRow, endRow); });
    };
    DataTree.prototype.getDescendantNodes = function (node) {
        this.returnRows = [];
        this._traverseAll(node);
        return this.returnRows;
    };
    DataTree.prototype.getPageData = function (pageNum, pageSize) {
        var _this = this;
        this.rowCounter = 0;
        this.returnRows = [];
        if (pageSize < 0) {
            this.rootNode.childNodes.forEach(function (n) { return _this._traverseAll(n); });
        }
        else {
            this.rootNode.childNodes.forEach(function (n) { return _this._traverse(n, pageNum * pageSize, (pageNum + 1) * pageSize - 1); });
        }
        return this.returnRows;
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
    DataTree.prototype._deleteChildrenNodes = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this._deleteChildrenNodes(node.childNodes[i]);
        }
        var dataIndex = this.inputData.indexOf(node);
        this.inputData.splice(dataIndex, 1);
        node.childNodes = [];
    };
    DataTree.prototype.deleteChildren = function (node) {
        this._deleteChildrenNodes(node);
    };
    return DataTree;
}());
exports.DataTree = DataTree;
//# sourceMappingURL=datatree.js.map