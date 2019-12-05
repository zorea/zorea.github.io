// Deriv-bot: Set the minimum width of a statement block to be wider than default.
Blockly.BlockSvg.MIN_BLOCK_X_WITH_STATEMENT = 100 * Blockly.BlockSvg.GRID_UNIT;

// Deriv-bot: Root block hat replaces with standard rounded corner
Blockly.BlockSvg.START_HAT_PATH = `m 0,${Blockly.BlockSvg.CORNER_RADIUS} A ${Blockly.BlockSvg.CORNER_RADIUS}, ${Blockly.BlockSvg.CORNER_RADIUS} 0 0,1 ${Blockly.BlockSvg.CORNER_RADIUS},0`;

// Deriv-bot: Changed the height of a row in a statement block to be 10.
Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y = 10 * Blockly.BlockSvg.GRID_UNIT;

// Deriv-bot: visual improvement: changed editable field padding from 8 to 16
Blockly.BlockSvg.EDITABLE_FIELD_PADDING = 16;

/**
 * For a block with output,
 * determine start and end padding, based on connected inputs.
 * Padding will depend on the shape of the output, the shape of the input,
 * and possibly the size of the input.
 * @param {!Array.<!Array.<!Object>>} input_rows Partially calculated rows.
 */
Blockly.BlockSvg.prototype.computeOutputPadding_ = function(input_rows) {
    // Only apply to blocks with outputs and not single fields (shadows).
    if (
        !this.getOutputShape() ||
        !this.outputConnection ||
        (this.isShadow() && !Blockly.scratchBlocksUtils.isShadowArgumentReporter(this))
    ) {
        return;
    }

    // Blocks with outputs must have single row to be padded.
    if (input_rows.length > 1) {
        return;
    }

    const row   = input_rows[0];
    const shape = this.getOutputShape();

    // Reset any padding: it's about to be set.
    row.paddingStart = 0;
    row.paddingEnd   = 0;

    // Start row padding: based on first input or first field.
    const firstInput = row[0];
    const firstField = firstInput.fieldRow[0];
    let otherShape;

    // In checking the left/start side, a field takes precedence over any input.
    // That's because a field will be rendered before any value input.
    if (firstField) {
        otherShape = 0; // Field comes first in the row.
    } else {
        // Value input comes first in the row.
        const inputConnection = firstInput.connection;

        if (!inputConnection) {
            // deriv-bot: Don't collapse if there's no connection.
            return;
        } else if (!inputConnection.targetConnection) {
        // Not connected: use the drawn shape.
            otherShape = inputConnection.getOutputShape();
        } else {
        // Connected: use the connected block's output shape.
            otherShape = inputConnection.targetConnection.getSourceBlock().getOutputShape();
        }

        // Special case for hexagonal output: if the connection is larger height
        // than a standard reporter, add some start padding.
        // https://github.com/LLK/scratch-blocks/issues/376
        if (shape === Blockly.OUTPUT_SHAPE_HEXAGONAL && otherShape !== Blockly.OUTPUT_SHAPE_HEXAGONAL) {
            const deltaHeight = firstInput.renderHeight - Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER;

            // One grid unit per level of nesting.
            row.paddingStart += deltaHeight / 2;
        }
    }

    row.paddingStart += Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING[shape][otherShape];

    // End row padding: based on last input or last field.
    const lastInput = row[row.length - 1];

    // In checking the right/end side, any value input takes precedence over any field.
    // That's because fields are rendered before inputs...the last item
    // in the row will be an input, if one exists.
    if (lastInput.connection) {
        // Value input last in the row.
        const inputConnection = lastInput.connection;

        if (!inputConnection.targetConnection) {
            // Not connected: use the drawn shape.
            otherShape = inputConnection.getOutputShape();
        } else {
        // Connected: use the connected block's output shape.
            otherShape = inputConnection.targetConnection.getSourceBlock().getOutputShape();
        }
        // Special case for hexagonal output: if the connection is larger height
        // than a standard reporter, add some end padding.
        // https://github.com/LLK/scratch-blocks/issues/376
        if (shape === Blockly.OUTPUT_SHAPE_HEXAGONAL && otherShape !== Blockly.OUTPUT_SHAPE_HEXAGONAL) {
            const deltaHeight = lastInput.renderHeight - Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER;

            // One grid unit per level of nesting.
            row.paddingEnd += deltaHeight / 2;
        }
    } else {
        // No input in this row - mark as field.
        otherShape = 0;
    }

    row.paddingEnd += Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING[shape][otherShape];
};
