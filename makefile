all:
	node r.js -o static\js\app.build.js
	python app.py build