import { localize } from 'deriv-translations';

Blockly.Blocks.lists_isEmpty = {
    init() {
        this.jsonInit(this.definition());
    },
    definition(){
        return {
            message0: localize('list %1 is empty'),
            args0   : [
                {
                    type : 'input_value',
                    name : 'VALUE',
                    check: ['Array'],
                },
            ],
            output         : 'Boolean',
            outputShape    : Blockly.OUTPUT_SHAPE_ROUND,
            colour         : Blockly.Colours.Base.colour,
            colourSecondary: Blockly.Colours.Base.colourSecondary,
            colourTertiary : Blockly.Colours.Base.colourTertiary,
            tooltip        : localize('Checks if a given list is empty'),
            category       : Blockly.Categories.List,
        };
    },
    meta(){
        return {
            'display_name': localize('Is list empty?'),
            'description' : localize('This block checks if a given list is empty. It returns “True” if the list is empty, “False” if otherwise.'),
        };
    },
};

Blockly.JavaScript.lists_isEmpty = block => {
    const list = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_MEMBER) || '[]';
    const isVariable = block.workspace.getAllVariables().findIndex(variable => variable.name === list) !== -1;

    const code = isVariable ? `!${list} || !${list}.length` : `!${list}.length`;
    return [code, Blockly.JavaScript.ORDER_LOGICAL_NOT];
};
