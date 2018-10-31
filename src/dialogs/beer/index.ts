// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// greeting.js defines the greeting dialog
import { ComponentDialog, DialogContext, PromptValidatorContext, TextPrompt, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { StatePropertyAccessor, TurnContext } from 'botbuilder';

// User state for greeting dialog
import { UserProfile } from '../greeting/userProfile';


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
export class BeerDialog extends ComponentDialog {

  private userProfileAccessor: StatePropertyAccessor<UserProfile>;

  constructor(dialogId: string, userProfileAccessor: StatePropertyAccessor<UserProfile>) {
    super(dialogId);

    // validate what was passed in
    if (!dialogId) throw ('Missing parameter.  dialogId is required');
    if (!userProfileAccessor) throw ('Missing parameter.  userProfileAccessor is required');

    // Save off our state accessor for later use
    this.userProfileAccessor = userProfileAccessor;
  }
}
