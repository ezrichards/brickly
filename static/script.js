var variableStore = {};
var variables = [];
var workspace;
var added = false;

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
        if(event.type === Blockly.Events.BLOCK_CHANGE) {
            // BLOCK_CHANGE is called for dropdown change too - we only want text field change
            if(event.name === "VARIABLE_NAME") {
                // save variable name under block id key
                variableStore[event.blockId] = '?' + event.newValue; // key should have ? in front to signify variable
    
                if(workspace !== undefined) {
                    for(let block in workspace.getAllBlocks()) {
                        if(workspace.getAllBlocks()[block].type === "triple") {
                            let s = workspace.getAllBlocks()[block].inputList[0].fieldRow[0].generatedOptions_;            
                            for(let key in variableStore) { 
                                if(added) {
                                    s[1] = [variableStore[key], key];
                                }
                                else {
                                    s.splice(1, 0, [variableStore[key], key]);
                                    added = true;
                                }
                            }
                        }
                    }
                }
            }            
        }
        else if(event.type === Blockly.Events.BLOCK_DELETE) {
            // When block is deleted, remove it from the variableStore
            for(let key in variableStore) { // (Move this to block delete)
                // remove old variablename if exists
                if(key == event.blockId) {
                    delete variableStore[event.blockId];
                }
            }
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
    onchange: function(event) {
        // if(event.type == Blockly.Events.BLOCK_CHANGE) {
        //     let s = this.inputList[0].fieldRow[0].generatedOptions_;
        //     s.splice(1, 0, ["THIS IS A TEST", "testId"])
        //     console.log("S: ", s);

        //     for(let key in variableStore) { 
        //         console.log("key: ", key);
        //     }
        // }
    }
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

// TODO bNodes may still be happening
Blockly.Extensions.register('dynamic_let_extension', function() {
    let s = this.inputList[0]?.fieldRow?.[1]?.value_;
    let payload = {
        "subject": s == "CHANGE ME" ? null : s, 
        "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "object": "http://www.w3.org/2002/07/owl#Class",
    };
    
    let options = [["Any", "ANY"]];    
    for(let key in variableStore) {
        variables.push([key, variableStore[key]]);
    }

    if(s !== "ANY") {
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
    
    let options = [["Change Me", "CHANGE"]];
    for(let key in variableStore) {
        options.push([variableStore[key], key]);
    }

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
    ))
    
    let predicateOptions = [["Change Me", "CHANGE"]];
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
    ]
}

workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

Blockly.JavaScript['let'] = function(block) {
    let varName = block.inputList[0]?.fieldRow?.[1]?.value_;
    let type = block.inputList[0]?.fieldRow?.[3]?.selectedOption_[0];
    let str = "";

    if(type != "Any") {
        str += "?" + varName + " rdf:type <" + type + "> .\n";
    }
    return str;
};

let prefix = 'PREFIX brick: <https://brickschema.org/schema/Brick#>\n\
PREFIX unit: <http://qudt.org/vocab/unit/>\n\
PREFIX owl: <http://www.w3.org/2002/07/owl#>\n\
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
\
SELECT * WHERE {\n';
let suffix = '}';
Blockly.JavaScript['triple'] = function(block) {
    let s = block.inputList[0]?.fieldRow?.[0]?.selectedOption_[0];
    let p = block.inputList[1]?.fieldRow?.[0]?.selectedOption_[0];
    let o = block.inputList[2]?.fieldRow?.[0]?.selectedOption_[0];

    let code = "";
    if(!s.startsWith("?")) {
        code += "   <" + s + ">";
    }
    else {
        code += s;
    }

    code += " <" + p + "> ";
    
    if(!o.startsWith("?")) {
        code += " <" + o + ">";
    }
    else {
        code += o;
    }
    code += " . \n"
    return code;
};

let limitStr = "";
Blockly.JavaScript['limit'] = function(block) {
    let limit = block.getFieldValue('limit_num');
    if(limit > -1) {
        limitStr += " LIMIT " + limit;
    }
    return "";
};

const yasgui = new Yasgui(document.getElementById("yasgui"));
function generateCode() {
    let code = Blockly.JavaScript.workspaceToCode(workspace);
    let query = prefix + code + suffix + limitStr;
    yasgui.getTab().yasqe.setValue(query);
}
