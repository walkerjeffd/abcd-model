from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/theory.html')
def theory():
    return render_template('theory.html')

@app.route('/simulation.html')
def simulation():
    return render_template('simulation.html')

@app.route('/calibration.html')
def calibration():
    return render_template('calibration.html')

@app.route('/montecarlo.html')
def montecarlo():
    return render_template('montecarlo.html')

if __name__ == '__main__':
    app.run(debug=True)
