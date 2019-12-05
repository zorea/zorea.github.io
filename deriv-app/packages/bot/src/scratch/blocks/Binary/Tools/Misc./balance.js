import { localize } from 'deriv-translations';
import config       from '../../../../../constants';

Blockly.Blocks.balance = {
    init() {
        this.jsonInit(this.definition());
        const balanceTypeField = this.getField('BALANCE_TYPE');
        balanceTypeField.setValidator(value => {
            if (value === 'STR') {
                this.setOutput(true, 'String');
            } else if (value === 'NUM') {
                this.setOutput(true, 'Number');
            }
            this.initSvg();
            this.render(false);
            return undefined;
        });
    },
    definition(){
        return {
            message0: localize('Balance: %1'),
            args0   : [
                {
                    type   : 'field_dropdown',
                    name   : 'BALANCE_TYPE',
                    options: config.lists.BALANCE_TYPE,
                },
            ],
            output         : null,
            outputShape    : Blockly.OUTPUT_SHAPE_ROUND,
            colour         : Blockly.Colours.Base.colour,
            colourSecondary: Blockly.Colours.Base.colourSecondary,
            colourTertiary : Blockly.Colours.Base.colourTertiary,
            tooltip        : localize('This block returns account balance'),
            category       : Blockly.Categories.Miscellaneous,
        };
    },
    meta(){
        return {
            'display_name': localize('Account balance'),
            'description' : localize('This block gives you the balance of your account either as a number or a string of text.'),
        };
    },
};

Blockly.JavaScript.balance = block => {
    const balanceType = block.getFieldValue('BALANCE_TYPE');

    const code = `Bot.getBalance('${balanceType}')`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
