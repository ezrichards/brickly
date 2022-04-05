from flask import Flask, render_template
from flask import request, jsonify
import rdflib
from rdflib.util import from_n3
import sys
from collections import Counter

graph = rdflib.Graph()
graph.parse(sys.argv[1], format="turtle")
graph.parse("brick-classes.ttl", format="turtle")

# Next step: Run generated queries (after checking on sparql.gtf.fyi)
# graph.loadfile(bldg.ttl) -> graph.serve()
# brickschema web interface docs
# see on github: py-brickschema web.py & index.html

app = Flask(__name__)

def to_uri(abbr):
    if abbr:
        return from_n3(abbr, nsm=graph.namespace_manager)

def filter_bnodes(seq):
    res = []
    for item in seq:
        if isinstance(item, (tuple, list)):
            if any(isinstance(x, rdflib.BNode) for x in item):
                continue
        elif isinstance(item, rdflib.BNode):
            continue
        res.append(item)
    return list(set(res))

@app.route("/")
def home():
    return render_template("index.html")

# TODO: sort by decreasing frequency/alphabetically; use Counter class from collections, c = counter(x) and then c.most_common()

@app.route("/subjects", methods=['POST'])
def get_subjects():
    pred = to_uri(request.args.get("predicate", None))
    obj = to_uri(request.args.get("object", None))

    # can't filter bnodes in counter or duplicates will be filtered too
    c = Counter(graph.subjects(predicate=pred, object=obj))

    print(c.most_common())

    return jsonify(filter_bnodes(graph.subjects(predicate=pred, object=obj)))

@app.route("/predicates", methods=['POST'])
def get_predicates():
    sub = to_uri(request.args.get("subject", None))
    obj = to_uri(request.args.get("object", None))
    return jsonify(filter_bnodes(graph.predicates(subject=sub, object=obj)))

@app.route("/objects", methods=['POST'])
def get_objects():
    sub = to_uri(request.args.get("subject", None))
    pred = to_uri(request.args.get("predicate", None))
    return jsonify(filter_bnodes(graph.objects(subject=sub, predicate=pred)))

@app.route("/subject_objects", methods=['POST'])
def get_subject_objects():
    pred = to_uri(request.args.get("predicate", None))
    return jsonify(filter_bnodes(graph.subject_objects(predicate=pred)))
    
@app.route("/subject_predicates", methods=['POST'])
def get_subject_predicates():
    obj = to_uri(request.args.get("object", None))
    return jsonify(filter_bnodes(graph.subject_predicates(object=obj)))
    
@app.route("/predicate_objects", methods=['POST'])
def get_predicate_objects():
    sub = to_uri(request.args.get("subject", None))
    return jsonify(filter_bnodes(graph.predicate_objects(subject=sub)))

if __name__ == "__main__":
    app.run()
