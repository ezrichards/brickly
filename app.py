import json
from flask import Flask, render_template
from flask import request, jsonify
import rdflib
from rdflib.util import from_n3
import sys
from collections import Counter

graph = rdflib.Graph()
graph.parse(sys.argv[1], format="turtle")
graph.parse("brick-classes.ttl", format="turtle")

app = Flask(__name__)

def to_uri(abbr):
    if abbr:
        return from_n3(abbr, nsm=graph.namespace_manager)

def wrap_counter(func):
    def returned_func():
        res = func()
        c = Counter(res)
        return jsonify([x[0] for x in c.most_common()])
    return returned_func

def filter_bnodes(seq):
    res = []
    for item in seq:
        if isinstance(item, (tuple, list)):
            if any(isinstance(x, rdflib.BNode) for x in item):
                continue
        elif isinstance(item, rdflib.BNode):
            continue
        res.append(item)
    return res

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/subjects", methods=['POST'], endpoint='get_subjects')
@wrap_counter
def get_subjects():
    pred = to_uri(request.args.get("predicate", None))
    obj = to_uri(request.args.get("object", None))
    return graph.subjects(predicate=pred, object=obj)

@app.route("/predicates", methods=['POST'], endpoint='get_predicates')
@wrap_counter
def get_predicates():
    sub = to_uri(request.args.get("subject", None))
    obj = to_uri(request.args.get("object", None))
    return graph.predicates(subject=sub, object=obj)

@app.route("/objects", methods=['POST'], endpoint='get_objects')
@wrap_counter
def get_objects():
    sub = to_uri(request.args.get("subject", None))
    pred = to_uri(request.args.get("predicate", None))
    return graph.objects(subject=sub, predicate=pred)

@app.route("/subject_objects", methods=['POST'], endpoint='get_subject_objects')
@wrap_counter
def get_subject_objects():
    pred = to_uri(request.args.get("predicate", None))
    return graph.subject_objects(predicate=pred)
    
@app.route("/subject_predicates", methods=['POST'], endpoint='get_subject_predicates')
@wrap_counter
def get_subject_predicates():
    obj = to_uri(request.args.get("object", None))
    return graph.subject_predicates(object=obj)
    
@app.route("/predicate_objects", methods=['POST'], endpoint='get_predicate_objects')
@wrap_counter
def get_predicate_objects():
    sub = to_uri(request.args.get("subject", None))
    return graph.predicate_objects(subject=sub)

if __name__ == "__main__":
    app.run()
