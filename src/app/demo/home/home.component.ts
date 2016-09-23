import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'home',
    template: `
    <h2>This is a demo application for the TreeGrid control for Angular 2.</h2>

    Here is the description of what each demo does:

    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <td>Demo
                            </td>
                            <td>Description
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <a routerLink="/demo1">Simple Table Data</a>
                            </td>
                            <td>
                                Introduce the simplest way to instantiate the TreeGrid control that make uses of statically defined data. 
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo2">Loading with Ajax</a>
                            </td>
                            <td>
                                Load the grid data from Ajax call to an external web service.
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo3">Lazy Loading with Ajax</a>
                            </td>
                            <td>
                                Child rows are not retrieved initially. They are retrieved and inserted into the grid When you click the "chevron" to expand the row.
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo4">Formatting with Pipes</a>
                            </td>
                            <td>
                                You can format or alter the content of the cell by providing one or more Pipes. If more than one is provided, they will be chained.
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo5">Custom Column Rendering</a>
                            </td>
                            <td>
                                You can also control completely how the grid cell is rendered by providing a rendering function. 
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo6">Modal Dialog Editor</a>
                            </td>
                            <td>
                                Data in the grid can be updated through a custom modal dialog editor (Modal dialog component is not part of this library. But the demo  provided a sample )
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo7">Server-side Searching</a>
                            </td>
                            <td>
                                Using server-side method to perform the searching.
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <a routerLink="/demo8">Grouping by Column(s)</a>
                            </td>
                            <td>
                                A different way of organizing data into tree structures. In this example, the data are grouped by "Origin" and "Family Name" columns.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
      
    `,
    directives: [ ROUTER_DIRECTIVES ]
})
export class HomeComponent {
}