import { localize } from 'deriv-translations';

Blockly.Blocks.text_length = {
    init() {
        this.jsonInit(this.definition());
    },
    definition(){
        return {
            message0: localize('length of %1'),
            args0   : [
                {
                    type: 'input_value',
                    name: 'VALUE',
                },
            ],
            output         : 'Number',
            outputShape    : Blockly.OUTPUT_SHAPE_ROUND,
            colour         : Blockly.Colours.Base.colour,
            colourSecondary: Blockly.Colours.Base.colourSecondary,
            colourTertiary : Blockly.Colours.Base.colourTertiary,
            tooltip        : localize('Text String Length'),
            category       : Blockly.Categories.Text,
        };
    },
    meta(){
        return {
            'display_name': localize('Text String Length'),
            'description' : localize('Returns the number of characters of a given string of text, including numbers, spaces, punctuation marks, and symbols.'),
        };
    },
};

Blockly.JavaScript.text_length = block => {
    const text = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_FUNCTION_CALL) || '\'\'';

    const code = `${text}.length`;
    return [code, Blockly.JavaScript.ORDER_MEMBER];
};
