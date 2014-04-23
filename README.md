Web-based Interactive Watershed Model (WIWM)
============================================

Demonstrates a stand-alone client-side web application for interactive environmental modeling. Implements the abcd water balance model for simple watershed hydrology.

Uses LocalStorage to maintain application state across pages and between browser sessions. Uses File API and HTML5 to load and save input/output data as text files.

The application is developed using Flask, but can be converted to a collection of static HTML/CSS/JavaScript files using [Frozen-Flask](https://pythonhosted.org/Frozen-Flask/).

Part of a PhD research project by [Jeffrey D. Walker](http://walkerjeff.com), Tufts University

See [phd.walkerjeff.com](phd.walkerjeff.com) for more information about this research.

Overview
--------

The code is organized as follows:

- `static/` contains the front-end and client-side web application code built using backbone.js and require.js
- `templates/` contains the individual pages (aka views) of the application
- 'app.py' contains the Flask application code and routes for the individual pages

Installation
------------

Set up a new virtual environment using [virtualenv](https://pypi.python.org/pypi/virtualenv), and then activate it.

Install dependencies.

```shell
pip install -r requirements.txt
```

You will also need node.js and the require.js optimization script [r.js](http://requirejs.org/docs/download.html#rjs) saved to the root of this directory.

Run Local Server
----------------

To run the application using a local testing server, simply execute app.py

```shell
python app.py
```

Build Static HTML Files
------------------

To build a static version of the HTML files, run the build command

```shell
python app.py build
```

To check that the build worked, run a `SimpleHTTPServer` within the build directory

```shell
cd ./build
python -m SimpleHTTPServer
```

Open a web browser, and navigate to <http://127.0.0.1:8000/>

Build Front-end Code
--------------------

The front-end HTML/CSS/JS code can be optimized (minified, concatenated) using the require.js optimization script. The optimization configuraiton is located in `static/js/app.build.js`.

```shell
node r.js -o static/js/app.build.js
```

This will place the optimized front end code in the `build/static` folder. Best to run this command after generating the static HTML files, which will also copy the original (unminified) code to the `build/static` folder.

Create Deployment
-----------------

A deployment involves first clearing out the `build` folder, then building the static HTML files from Flask, and finally creating the optimized front-end static files using node/require.js. These steps are included in the `makefile`. To run this, simply enter:

```shell
make
```

And to clear out a previous build, run:

```shell
make clean
```
