TreeGrid for Angular 2
======================

TreeGrid represents data in a tree-like structure. It supports table display of hierarchical data, columns resizing, sorting by column, paging and filtering. It also supports editing through the use of modal dialog.

Due to the vast possibilities of designing such dialog and its constituent controls, we decided that it's best to let the user to implement such dialog and we only provide the communication mechanism between the dialog and the TreeGrid control.

Getting Started
===============

Classes
=======

Components
==========

TreeGrid
--------

### Methods
#### reloadAjax
Reloading data from server-side method. Use either the url parameter provided or the settings in _AjaxConfig_
Input Parameter | Description
------------ | -------------
url (optional) | If provided, the url parameter will override the settings from _AjaxConfig_

### Properties
#### treeGridDef


### Events
#### onRowClick
Click event on a row. _selectedRow is not set.
Event Parameter | Description
------------ | -------------
row | Clicked row


#### onRowDblClick
Double-click event on a row. Internally, _selectedRow is set.
Event Parameter | Description
------------ | -------------
row | Selected row

SortableHeader
--------------



