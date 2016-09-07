"use strict";
(function (SortDirection) {
    SortDirection[SortDirection["ASC"] = 0] = "ASC";
    SortDirection[SortDirection["DESC"] = 1] = "DESC";
})(exports.SortDirection || (exports.SortDirection = {}));
var SortDirection = exports.SortDirection;
(function (EditorType) {
    EditorType[EditorType["MODAL"] = 0] = "MODAL";
    EditorType[EditorType["INLINE"] = 1] = "INLINE";
})(exports.EditorType || (exports.EditorType = {}));
var EditorType = exports.EditorType;
var TreeGridDef = (function () {
    function TreeGridDef() {
        this.columns = [];
        this.data = [];
        this.paging = true;
        this.sort = true;
        this.pageSize = 25; /* make it small for debugging */
        //currentPage: number = 0;
        this.defaultOrder = [];
        this.hierachy = null;
        this.ajax = null;
        this.editor = null;
    }
    return TreeGridDef;
}());
exports.TreeGridDef = TreeGridDef;
//# sourceMappingURL=treedef.js.map