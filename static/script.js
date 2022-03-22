Blockly.Blocks['select'] = {
    init: function() {
        this.jsonInit({
        "message0": 'select %1 where',
        "args0": [
            {
            "type": "input_value",
            "name": "VALUE",
            "check": "String"
            }
        ],
        "colour": 160,
        "tooltip": "Selects %1 where %2.",
        "helpUrl": "http://www.w3schools.com/jsref/jsref_length_string.asp",
        "nextStatement": null,
        });
    }
};

Blockly.Blocks['let'] = {
    init: function() {
        this.jsonInit({
        "message0": 'let %1 be a %2',
        "args0": [
            {
            "type": "input_value",
            "name": "VALUE",
            "check": "String"
            },
            {
            "type": "input_dummy",
            "name": "objects",
            "options": [
                [
                "x",
                "X"
                ],
                [
                "y",
                "Y"
                ],
                [
                "New variable..",
                "NEW_VARIABLE"
                ]
            ]
            },
        ],
        "colour": 160,
        "tooltip": "Selects %1 where %2.",
        "helpUrl": "",
        "nextStatement": null,
        "previousStatement": null,
        "extensions": ["dynamic_let_extension"],
        });
    }
};

Blockly.Blocks['limit'] = {
    init: function() {
        this.jsonInit({
        "message0": 'limit %1 ',
        "args0": [
            {
            "type": "input_value",
            "name": "VALUE",
            "check": "Number"
            }
        ],
        "colour": 160,
        "tooltip": "Limits query to %1 results.",
        "helpUrl": "http://www.w3schools.com/jsref/jsref_length_string.asp",
        "previousStatement": null,
        });
    }
};

Blockly.Blocks['triple'] = {
    init: function() {
        this.jsonInit({
        "type": "triple",
        "message0": "%1 %2 %3",
        "args0": [
            {
            "type": "input_dummy",
            "name": "subject",
            "options": [
                [
                "x",
                "X"
                ],
                [
                "y",
                "Y"
                ],
                [
                "New variable..",
                "NEW_VARIABLE"
                ]
            ]
            },
            {
            "type": "input_dummy",
            "name": "predicate",
            "options": [
                [
                "x",
                "X"
                ],
                [
                "y",
                "Y"
                ],
                [
                "New variable..",
                "NEW_VARIABLE"
                ]
            ]
            },
            {
            "type": "input_dummy",
            "name": "object",
            "options": [
                [
                "y",
                "Y"
                ],
                [
                "x",
                "X"
                ],
                [
                "New variable..",
                "NEW_VARIABLE"
                ]
            ]
            }
        ],
        "extensions": ["dynamic_triple_extension"],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Create a triple block!",
        "helpUrl": "https://www.w3.org/TR/rdf-concepts/#section-triples"
        });
    },
};

async function post_data(endpoint, data) {
    const response = await fetch("http://localhost:5000/" + endpoint, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return response.json();
}

Blockly.Extensions.register('dynamic_let_extension', function() {
    let s = this.inputList[0]?.fieldRow?.[0]?.value_;
    let p = this.inputList[0]?.fieldRow?.[0]?.value_;
    let o = this.inputList[0]?.fieldRow?.[0]?.value_;
    let payload = {
        "subject": s == "CHANGE ME" ? null : s, 
        "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "object": "http://www.w3.org/2002/07/owl#Class",
    };
    
    var options = [["Any", "ANY"]];
    if(s !== "ANY") {
        post_data("objects", payload).then(subjects => {
            for(let i = 0; i < subjects.length; i++) { 
                options.push([subjects[i], subjects[i]]);
            }
        });
    }

    this.getInput('objects').appendField(new Blockly.FieldDropdown(
        function() {
            return options;   
        }
    ), 'objects_input_field')
})

Blockly.Extensions.register('dynamic_triple_extension', function() {
    let s = this.inputList[0]?.fieldRow?.[0]?.value_;
    let p = this.inputList[0]?.fieldRow?.[0]?.value_;
    let o = this.inputList[0]?.fieldRow?.[0]?.value_;
    let payload = {
        "subject": s == "CHANGE ME" ? null : s,
        "predicate": p == "CHANGE ME" ? null : p,
        "object": o == "CHANGE ME" ? null : o,
    };
    
    var options = [["Change Me", "CHANGE"]];
    if(s !== "CHANGE") {
        post_data("subjects", payload).then(subjects => {
            for(let i = 0; i < subjects.length; i++) { 
                options.push([subjects[i], subjects[i]]);
            }
        });
    }

    this.getInput('subject').appendField(new Blockly.FieldDropdown(
        function() {
            return options;   
        }
    ), 'subject_input_field')
    
    var predicateOptions = [["Change Me", "CHANGE"]];
    if(p !== "CHANGE") {
        post_data("predicates", payload).then(predicates => {
            for(let i = 0; i < predicates.length; i++) { 
                predicateOptions.push([predicates[i], predicates[i]]);
            }
        });
    }

    this.getInput('predicate').appendField(new Blockly.FieldDropdown(
        function() {
            return predicateOptions;   
        }
    ), 'predicate_input_field')

    this.getInput('object').appendField(new Blockly.FieldDropdown(
        function() {
            return options;   
        }
    ), 'object_input_field')
});

var toolbox = {
    "kind": "flyoutToolbox",
    "contents": [
        {
        "kind": "block",
        "type": "limit"
        },
        {
        "kind": "block",
        "type": "select"
        },
        {
        "kind": "block",
        "type": "let"
        },
        {
        "kind": "block",
        "type": "triple",
        },
        {
        "kind": "block",
        "type": "controls_if"
        },
        {
        "kind": "block",
        "type": "controls_repeat_ext"
        },
        {
        "kind": "block",
        "type": "logic_compare"
        },
        {
        "kind": "block",
        "type": "math_number"
        },
        {
        "kind": "block",
        "type": "math_arithmetic"
        },
        {
        "kind": "block",
        "type": "text"
        },
        {
        "kind": "block",
        "type": "text_print"
        },
    ]
}

var workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

Blockly.JavaScript['select'] = function(block) {
    var dropdown_subject = block.getFieldValue('subject');
    var text_predicate = block.getFieldValue('PREDICATE');
    var dropdown_object = block.getFieldValue('object');
    // TODO: Assemble JavaScript into code variable.
    var code = 'SELECT...;\n';
    return code;
};

Blockly.JavaScript['triple'] = function(block) {
    var dropdown_subject = block.getFieldValue('subject');
    var text_predicate = block.getFieldValue('PREDICATE');
    var dropdown_object = block.getFieldValue('object');
    // TODO: Assemble JavaScript into code variable.
    var code = 'TRIPLE:\n' + dropdown_subject + " " + text_predicate + " " + dropdown_object;
    return code;
}; // generate SPARQL directly?

// TODO generate link to "Resultant query" of sparql.gtf.fyi or embed it inside
function generateCode() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log(code);
}
