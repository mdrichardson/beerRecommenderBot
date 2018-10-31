"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// greeting.js defines the greeting dialog
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;
/**
 * Demonstrates the following concepts:
 *  Use a subclass of ComponentDialog to implement a multi-turn conversation
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfileAccessor property accessor for user state
 */
class BeerDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, userProfileAccessor) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw ('Missing parameter.  dialogId is required');
        if (!userProfileAccessor)
            throw ('Missing parameter.  userProfileAccessor is required');
        // Save off our state accessor for later use
        this.userProfileAccessor = userProfileAccessor;
    }
}
exports.BeerDialog = BeerDialog;
//# sourceMappingURL=index.js.map