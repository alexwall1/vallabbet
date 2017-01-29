# -*- coding: utf-8 -*-

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def root():
    return render_template('dragndrop.html')


if __name__ == "__main__":
    app.run(debug=True)
