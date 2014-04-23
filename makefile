all:
	python app.py build
	rm -rf build/static
	node r.js -o static/js/app.build.js

clean:
	rm -rf build