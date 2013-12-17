phd-abcd
========

Web-based Interactive Water Balance Model

Jeffrey D. Walker

Installation
------------

Set up a new virtual environment using [virtualenv](https://pypi.python.org/pypi/virtualenv), and then activate it.

Install dependencies.

```shell
pip install -r requirements.txt
```

Run Local Server
----------------

To run the application using a local testing server, simply execute app.py

```shell
python app.py
```

Build Static Files
------------------

To build a static version of the application, run the `build` command

```shell
python app.py build
```

To check that the build worked, run a `SimpleHTTPServer` within the build directory

```shell
cd ./build
python -m SimpleHTTPServer
```

Open a web browser, and navigate to <http://127.0.0.1:8000/>