TreeGrid for Angular 2
======================

TreeGrid represents data in a tree-like structure. It supports table display of hierarchical data, columns resizing, sorting by column, paging and filtering. It also supports editing through the use of modal dialog.

Due to the vast possibilities of designing such dialog and its constituent controls, we decided that it's best to let the user to implement such dialog and we only provide the communication mechanism between the dialog and the TreeGrid control.

Getting Started
===============

### Loading Data
There are three ways to populate the data in the TreeGrid.

Method | Description
------------ | -------------
Static | Data is statically defined in your code. Please see [Simple Data Setup](http://treegriddemo2016.azurewebsites.net)
Ajax | Data is loaded through an Ajax call. It is assumed that the call will return a complete set of data.
Ajax with lazy loading |  Data is loaded through an Ajax call. Only the top level set of data is assumed to be returned. When the user clicks open a tree node, additional calls are issued to retrieve the child data.

``` javascript
/* Static */
this.treeDef.data = [
            { emp_id: 101, firstname: "Tommen", lastname: "Baratheon" },
            ...
];

/* Ajax */
this.treeDef.ajax = {
    url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetAllEmployees', method: "POST"
};

/* Ajax with lazy loading */
this.treeDef.ajax = {
    url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetAllEmployees', method: "POST",
    lazyLoad: true
};

```
<a name="hierarchy"></a>
### Hierachy Definition

The TreeGrid displays the parent/child relationship within the data set. There are two ways to define the hierarchy:

* The relationship is defined through the use of [TreeGridDef.hierachy](#treehierarchy) 
* The relationship is defined through the use of [TreeGridDef.grouping](#groupconfig)

Interfaces, Classes, and Components
===================================

<a name="treehierarchy"></a>
### TreeHierarchy
Property | Description
------------ | -------------
foreignKeyField | Name of the data field that represents the child key field
primaryKeyField | Name of the data field that represents the parent key field

<a name="ajaxconfig"></a>
### AjaxConfig
Property | Description
------------ | -------------
url | Url of the Ajax call to retrieve data
method | GET or POST (At the time of this writing, Angular 2 seems to have trouble with GET. So all the demos have been coded with POST)
lazyLoad | If set to false, we assume tha the Ajax will return the whole data set. If set to true, only the top level rows are intially loaded. When the user clicks the expand icon beside the rows, the corresponding children rows will then be fetched (using the same url with with "id" parameter set to the value of the field referenced by _primaryKeyField_)
childrenIndicatorField | Used only when _lazyLoad_ set to true. This is the data field that indicates whether this row has children rows that can be fetched. So that the UI knows whether to place an "expand" icon beside the row
doNotLoad | If set to true, no data will be fetched initially. You can call _reloadAjax_ to fetch data.

<a name="groupconfig"></a>
### GroupConfig
Property | Description
------------ | -------------
groupByColumns | One or more [ColumnOrder](#columnorder) object. It defines one or more level of groupings, from left to right;
aggregateColumns | (currently not used)
requireSort | Is the data sorted according to the _groupByColumns_? If no, set this _requireSort_ to true

<a name="columnorder"></a>
### ColumnOrder
Property | Description
------------ | -------------
columnIndex | Zero-based index of the group column in [TreeGridDef.columns](#columndef) collection
sortDirection | [ASC](#sortdirection) or [DESC](#sortdirection)

<a name="columnorder"></a>
### ColumnDef
Property | Description
------------ | -------------
labelHtml | Header label
dataField | Name of the data field
width | width of the column in pixels
className | CSS class name
sortable | Whether this column can be sorted or not by clicking the column header
filterable | Whether this column will be used in filtering
sortDirection | [ASC](#sortdirection) or [DESC](#sortdirection)
render | customized rendering function. Please see the demo [Custom Column Rendering](http://treegriddemo2016.azurewebsites.net)
transforms | customize the column data using pipes. Please see the demo [Formatting with Pipes](http://treegriddemo2016.azurewebsites.net)

<a name="columntransform"></a>
### ColumnTransform
Property | Description
------------ | -------------
pipe | An object that implements the [PipeTransform](https://angular.io/docs/ts/latest/guide/pipes.html) interface; it could be from the built-in collection of Pipes or your own custom-built pipe
param | Optional parameter that will be sent to the Transform

### TreeGridDef
Property | Description
------------ | -------------
className | CSS class name
columns | A list of [ColumnDef](#columndef) declarations
data | Optional - the actual array of data
paging | Enable or disable paging. Default is _true_
sortable | Enable or disable sorting. Default is _true_
pageSize | Number of rows per page. Default is _25_
defaultOrder | (not used)
hierarchy (mispelled in code) | See section [Hierarchy](hierarchy)
ajax | Ajax configuration. See [AjaxConfig](#ajaxconfig)
editor | (not used)
filter | Indicates whether and how filtering is supported. If set to _true_, filtering is performed on the client-side, i.e. it will not fetch additional data through ajax. If the value is set to FilterConfig, filtering is performed on the server-side.
grouping | See section [Hierarchy](hierarchy)

### TreeGrid

#### Methods
reloadAjax
----------
Reloading data from server-side method. Use either the url parameter provided or the settings in _AjaxConfig_
Input Parameter | Description
------------ | -------------
url (optional) | If provided, the url parameter will override the settings from _AjaxConfig_

#### Properties
treeGridDef
-----------

#### Events
onRowClick
-----------
Click event on a row. _selectedRow is not set.
Event Parameter | Description
------------ | -------------
row | Clicked row


##### onRowDblClick
Double-click event on a row. Internally, _selectedRow is set.
Event Parameter | Description
------------ | -------------
row | Selected row

### SortableHeader

#### Methods

#### Properties

#### Events



