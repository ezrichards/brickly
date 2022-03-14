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
            "type": "field_input",
            "name": "PREDICATE",
            "text": "predicate"
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
        console.log(event);
        
        this.getInput('subject').removeField('subject_input_field');
        
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
            })
        }
        
        this.getInput('subject').appendField(new Blockly.FieldDropdown(
            function() {
                return options;   
            }
        ), 'subject_input_field')
    }
};

async function post_data(url, data) {
    const response = await fetch("http://localhost:5000/subjects", {
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
        })
    }

    this.getInput('subject').appendField(new Blockly.FieldDropdown(
        function() {
            return options;   
        }
    ), 'subject_input_field')
})

// Blockly.Extensions.register('dynamic_triple_extension',
//     function() {

//         let s = this.getInput('subject')?.fieldRow?.[0]?.value_;
//         let p = this.getInput('predicate')?.fieldRow?.[0]?.value_;
//         let o = this.getInput('object')?.fieldRow?.[0]?.value_;
//         let payload = {
    //             "subject": s == "CHANGE ME" ? null : s,
    //             "predicate": p == "CHANGE ME" ? null : p,
//             "object": o == "CHANGE ME" ? null : o,
//         };


//         console.log(this.getInput('subject'));
//         if (s !== "CHANGE ME") {
//             post_data("subjects", payload).then(subjects => {
//                 var options = [["Change Me", "CHANGE"]];
//                 for(let i = 0; i < subjects.length; i++) {
//                     options.push([subjects[i], subjects[i]]);
//                 }
//                 this.getInput('subject').appendField(new Blockly.FieldDropdown(function() {
    //                     return options;
//                 }), 'subject');
//             });
//         }
//         console.log(this.getInput('subject'));
//                 return;
//         post_data("predicates", payload).then(preds => {
    //             var options = [["Change Me", "CHANGE"]];
//             for(let i = 0; i < preds.length; i++) {
//                 options.push([preds[i], preds[i]]);
//             }
//             this.getInput('predicate').appendField(new Blockly.FieldDropdown(function() {
//                 return options;
//             }), 'predicate');
//         });

// original solution

//         // let s = this.getInput('subject');
//         // let o = this.getInput('object');
//         // let p = this.getInput('PREDICATE');

//         // console.log(s);
//         // console.log(o);
//         // console.log(p);

//         // // 1. get the current values of predicate and object fields
//         // // let o = this.getInput('object').getFieldValue();
//         // // let p = this.getInput('PREDICATE').getFieldValue();
       
//         // this.getInput('subject').appendField(new Blockly.FieldDropdown(
//         //     function() {
//         //         var options = [["Change Me", "CHANGE"]];

//         //         // 2.0. if the field value is "change me", make sure to ignore..
//         //         if(p != "CHANGE ME" && o != "CHANGE_ME") {
//         //             // 2.1. do a request to your server to get the possible subjects for this pred and obj
//         //             //      POST /subjects <- {'predicate': p, 'object': o}
//         //             // put into the 'options' array all the subjects returned by the server
//         //             payload = {
//         //                 "predicate": p,
//         //                 "object": o
//         //             }

//         //             post_data("test", payload).then(subjects => {
//         //                 // console.log(subjects);
//         //             });
//         //         }
//         //         return options;
//         //     }
//         // ), 'SUBJECT');

//         // this.getInput('object')
//         //     .appendField(new Blockly.FieldDropdown(
//         //         function() {
//         //         var options = [];
//         //         var now = Date.now();
//         //         for(var i = 0; i < 7; i++) {
//         //             var dateString = String(new Date(now)).substring(0, 3);
//         //             options.push([dateString, dateString.toUpperCase()]);
//         //             now += 24 * 60 * 60 * 1000;
//         //         }
//         //     return options;
//         // }), 'DAY');
//     }
// );

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
};

// on button click, update code- or just real-time generation
function generateCode() {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log(code);
}
