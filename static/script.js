var variableStore = {};
var variables = [];

Blockly.Blocks['let'] = {
    init: function() {
        this.jsonInit({
        "message0": 'let %1 be a %2',
        "args0": [
            {
            "type": "field_input",
            "name": "VARIABLE_NAME",
            "text": "variable"
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
    },
    onchange: function(event) {
        // make a dict/mapping of blockId -> variableName (only ever one block)
        if(event.type == Blockly.Events.BLOCK_CHANGE) {
            variableStore[event.blockId] = event.newValue; // save variable name under block id key
        }
        else if(event.type === Blockly.Events.BLOCK_DELETE) {
            // When block is deleted, remove it from the variableStore
            console.log("DELETE EVENT: " + event);

            for(var key in variableStore) { // (Move this to block delete)
                // remove old variablename if exists
                if(key == event.blockId) {
                    delete variableStore[event.blockId];
                }
            }
        }
        else if(event.type == Blockly.Events.BLOCK_DRAG) {
            console.log("DRAG EVENT: " + event);
        }
    }
};

Blockly.Blocks['limit'] = {
    init: function() {
        this.jsonInit({
        "message0": 'limit %1 ',
        "args0": [
            {
            "type": "field_number",
            "name": "limit_num",
            "value": 0,
            "min": 0
            },
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

// TODO: test certain block movements, some are still buggy
Blockly.Extensions.register('dynamic_let_extension', function() {
    let s = this.inputList[0]?.fieldRow?.[0]?.value_;
    let payload = {
        "subject": s == "CHANGE ME" ? null : s, 
        "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "object": "http://www.w3.org/2002/07/owl#Class",
    };
    
    var options = [["Any", "ANY"]];    
    if(s !== "ANY") {
        for(var key in variableStore) {
            variables.push([key, variableStore[key]]);
        }

        post_data("subjects", payload).then(subjects => {
            for(let i = 0; i < subjects.length; i++) { 
                options.push([subjects[i], subjects[i]]);
            }
        });
    }

    this.getInput('objects').appendField(new Blockly.FieldDropdown(
        function() {
            return options;   
        }
    ))
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
        for(var key in variableStore) {
            options.push([variableStore[key], key]);
        }

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
    ))
    
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
    ))

    this.getInput('object').appendField(new Blockly.FieldDropdown(
        function() {
            return options;   
        }
    ))
});

var toolbox = {
    "kind": "flyoutToolbox",
    "contents": [
        {
        "kind": "block",
        "type": "triple",
        },
        {
        "kind": "block",
        "type": "let"
        },
        {
        "kind": "block",
        "type": "limit"
        },
        // {
        // "kind": "block",
        // "type": "controls_if"
        // },
        // {
        // "kind": "block",
        // "type": "controls_repeat_ext"
        // },
        // {
        // "kind": "block",
        // "type": "logic_compare"
        // },
        // {
        // "kind": "block",
        // "type": "math_number"
        // },
        // {
        // "kind": "block",
        // "type": "math_arithmetic"
        // },
        // {
        // "kind": "block",
        // "type": "text"
        // },
        // {
        // "kind": "block",
        // "type": "text_print"
        // },
    ]
}

var workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

Blockly.JavaScript['let'] = function(block) {
    let varName = block.inputList[0]?.fieldRow?.[1]?.value_;
    let type = block.inputList[0]?.fieldRow?.[3]?.selectedOption_[0];
    let str = "";

    if(type != "Any") {
        str += "?" + varName + " rdf:type <" + type + "> .";
    }
    return str;
};

var prefix = 'SELECT * WHERE {\n';
var suffix = '}';
Blockly.JavaScript['triple'] = function(block) {
    let s = block.inputList[0]?.fieldRow?.[0]?.selectedOption_[0];
    let p = block.inputList[1]?.fieldRow?.[0]?.selectedOption_[0];
    let o = block.inputList[2]?.fieldRow?.[0]?.selectedOption_[0];

    var code = '\n';
    if(s.startsWith("http")) {
        code += "   <" + s + ">";
    }
    else {
        code += "   ?" + s;
    }

    code += " <" + p + ">";
    
    if(o.startsWith("http")) {
        code += " <" + o + ">";
    }
    else {
        code += " ?" + o;
    }

    code += " . \n"
    return code;
};

var limitStr = "";
Blockly.JavaScript['limit'] = function(block) {
    var limit = block.getFieldValue('limit_num');
    if(limit > -1) {
        limitStr += " LIMIT " + limit;
    }
    return "";
};

// TODO generate link to "Resultant query" of sparql.gtf.fyi or embed it inside
function generateCode() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById("code").innerHTML = prefix + code + suffix + limitStr;
}
