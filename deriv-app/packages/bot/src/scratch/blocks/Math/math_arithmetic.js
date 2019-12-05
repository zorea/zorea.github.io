import { localize } from 'deriv-translations';

Blockly.Blocks.math_arithmetic = {
    init() {
        this.jsonInit(this.definition());
    },
    definition(){
        return {
            message0: '%1 %2 %3',
            args0   : [
                {
                    type : 'input_value',
                    name : 'A',
                    check: 'Number',
                },
                {
                    type   : 'field_dropdown',
                    name   : 'OP',
                    options: [['+', 'ADD'], ['-', 'MINUS'], ['*', 'MULTIPLY'], ['/', 'DIVIDE'], ['^', 'POWER']],
                },
                {
                    type : 'input_value',
                    name : 'B',
                    check: 'Number',
                },
            ],
            output         : 'Number',
            outputShape    : Blockly.OUTPUT_SHAPE_ROUND,
            colour         : Blockly.Colours.Base.colour,
            colourSecondary: Blockly.Colours.Base.colourSecondary,
            colourTertiary : Blockly.Colours.Base.colourTertiary,
            tooltip        : localize('This block performs arithmetic operations between two numbers.'),
            category       : Blockly.Categories.Mathematical,
        };
    },
    meta(){
        return {
            'display_name': localize('Arithmetical operations'),
            'description' : localize('This block performs arithmetic operations between two numbers.'),
        };
    },
};

Blockly.JavaScript.math_arithmetic = block => {
    const operators = {
        ADD     : ['+', Blockly.JavaScript.ORDER_ADDITION],
        MINUS   : ['-', Blockly.JavaScript.ORDER_SUBTRACTION],
        MULTIPLY: ['*', Blockly.JavaScript.ORDER_MULTIPLICATION],
        DIVIDE  : ['/', Blockly.JavaScript.ORDER_DIVISION],
        POWER   : [null, Blockly.JavaScript.ORDER_COMMA], // Handle power separately.
    };

    const tuple = operators[block.getFieldValue('OP')];
    const operator = tuple[0];
    const order = tuple[1];

    const argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
    const argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';

    let code;

    // Power in JavaScript requires a special case since it has no operator.
    if (!operator) {
        code = `Math.pow(${argument0}, ${argument1})`;
        return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    }

    code = `${argument0} ${operator} ${argument1}`;
    return [code, order];
};
