# TreeGrid Control for Angular 2 

**[Live Demo](http://treegriddemo2016.azurewebsites.net)**

## Introduction

TreeGrid is written in Typscript. It is an Angular 2 component which you can embed in your own AppComponent. The project is in perpetual beta stage. Currently, it provides the following list of features:

1. Table data can be statically defined from the client side or retrieved through Ajax from the server side.

1. Expand or collapse table rows based on primary key and foreign key relationship.

1. Paging and sorting

1. Column resizing

## Dependencies

- npm

- SystemJS module loader

- JQuery (currently using 1.12.4)

- [jquery-resizable-columns](https://github.com/dobtco/jquery-resizable-columns)

- Bootstrap (currently using 3.3.7)

- Angular 2 RC 5

## Quick start

The project comes with an application that showcases all the features of the TreeGrid control.

**Make sure you have Node version >= 5.0 and NPM >= 3**
> Clone/Download the repo then edit `app.ts` inside [`/src/app/app.ts`](/src/app/app.ts)

```bash
# clone our repo
# --depth 1 removes all but one .git commit history
git clone https://github.com/five-star-potato/angular-treegrid.git

# change directory to our repo
cd angular-treegrid

# install the repo with npm
npm install

# start the server
npm start

```
go to [http://0.0.0.0:3000](http://0.0.0.0:3000) or [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT



