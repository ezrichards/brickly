import json
import io
import sys
from collections import Counter
from flask import Flask, render_template
from flask import request, jsonify
import rdflib
from rdflib.util import from_n3
from rdflib.plugins.sparql.results.jsonresults import JSONResultSerializer

graph = rdflib.Graph()
graph.parse("opt/" + sys.argv[1], format="turtle")
graph.parse("brick-classes.ttl", format="turtle")

app = Flask(__name__)

def to_uri(abbr):
    if abbr:
        return rdflib.URIRef(abbr)

def wrap_counter(func):
    def returned_func():
        res = func()
        res = set(filter_bnodes(res))  # make unique and remove bnodes
        return jsonify(list(sorted(res)))  # sort and convert to json
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

@app.route('/query', methods=['GET', 'POST'], endpoint='query_graph')
def query_graph():
    if request.method == "GET":
        query = request.args.get("query")
    elif (
        request.method == "POST"
        and request.content_type == "application/x-www-form-urlencoded"
    ):
        query = request.form.get("query")
    elif (
        request.method == "POST"
        and request.content_type == "application/sparql-query"
    ):
        print("SPARQL", request.form.keys())
        query = request.get_data()
    results = graph.query(query)
    json_results = io.StringIO()
    JSONResultSerializer(results).serialize(json_results)
    return jsonify(json.loads(json_results.getvalue()))

@app.route("/subjects", methods=['POST'], endpoint='get_subjects')
@wrap_counter
def get_subjects():
    pred = to_uri(request.json.get("predicate", None))
    obj = to_uri(request.json.get("object", None))
    return graph.subjects(predicate=pred, object=obj)

@app.route("/predicates", methods=['POST'], endpoint='get_predicates')
@wrap_counter
def get_predicates():
    sub = to_uri(request.json.get("subject", None))
    obj = to_uri(request.json.get("object", None))
    return graph.predicates(subject=sub, object=obj)

@app.route("/objects", methods=['POST'], endpoint='get_objects')
@wrap_counter
def get_objects():
    sub = to_uri(request.json.get("subject", None))
    pred = to_uri(request.json.get("predicate", None))
    return graph.objects(subject=sub, predicate=pred)

@app.route("/subject_objects", methods=['POST'], endpoint='get_subject_objects')
@wrap_counter
def get_subject_objects():
    pred = to_uri(request.json.get("predicate", None))
    return graph.subject_objects(predicate=pred)
    
@app.route("/subject_predicates", methods=['POST'], endpoint='get_subject_predicates')
@wrap_counter
def get_subject_predicates():
    obj = to_uri(request.json.get("object", None))
    return graph.subject_predicates(object=obj)
    
@app.route("/predicate_objects", methods=['POST'], endpoint='get_predicate_objects')
@wrap_counter
def get_predicate_objects():
    sub = to_uri(request.json.get("subject", None))
    return graph.predicate_objects(subject=sub)

if __name__ == "__main__":
    app.run("0.0.0.0")
