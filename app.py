from flask import Flask, render_template
from flask import request, jsonify
import rdflib
from rdflib.util import from_n3
import sys

graph = rdflib.Graph()
graph.parse(sys.argv[1], format="turtle")

app = Flask(__name__)

def to_uri(abbr):
    if abbr:
        return from_n3(abbr, nsm=graph.namespace_manager)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/subjects", methods=['POST'])
def get_subjects():
    pred = to_uri(request.args.get("predicate", None))
    obj = to_uri(request.args.get("object", None))
    return jsonify(list(graph.subjects(predicate=pred, object=obj)))

@app.route("/predicates")
def get_predicates():
    return 0

@app.route("/objects")
def get_objects():
    return 0

@app.route("/subject_objects")
def get_subject_objects():
    return 0
    
@app.route("/subject_predicates")
def get_subject_predicates():
    return 0
    
@app.route("/predicate_objects")
def get_predicate_objects():
    return 0

if __name__ == "__main__":
    app.run()
