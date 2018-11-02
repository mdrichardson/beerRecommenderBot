"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// greeting.js defines the greeting dialog
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// User state for greeting dialog
const userProfile_1 = require("./userProfile");
// Minimum lengh requirements for name and beerStyle
const NAME_LENGTH_MIN = 3;
// Dialog IDs
const PROFILE_DIALOG = 'profileDialog';
// Prompt IDs
const NAME_PROMPT = 'namePrompt';
const BEER_DRINKER_PROMPT = 'beerDrinker';
const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;
/**
 * Demonstrates the following concepts:
 *  Use a subclass of ComponentDialog to implement a multi-turn conversation
 *  Use a dialog to model
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfileAccessor property accessor for user state
 */
class GreetingDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, userProfileAccessor) {
        super(dialogId);
        /**
         * Waterfall Dialog step functions.
         *
         * Initialize our state.  See if the WaterfallDialog has state pass to it
         * If not, then just new up an empty UserProfile object
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.initializeStateStep = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile === undefined) {
                yield this.userProfileAccessor.set(step.context, new userProfile_1.UserProfile());
            }
            return yield step.next();
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a text prompt, prompt the user for their name.
         * Only prompt if we don't have this information already.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForNameStep = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            // if we have everything we need, go to the next step
            if (userProfile !== undefined && userProfile.name !== 'friend') {
                return yield this.verifyBeerDrinkingStep(step);
            }
            if (userProfile.name === 'friend') {
                // prompt for name, if missing
                return yield step.prompt(NAME_PROMPT, 'What should I call you?');
            }
            else {
                return yield step.next();
            }
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a choice prompt, see if the user drinks beer
         * Only prompt if we don't have this information already.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.verifyBeerDrinkingStep = (step) => __awaiter(this, void 0, void 0, function* () {
            // save name, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            '';
            if (userProfile.name === 'friend' && step.result) {
                let lowerCaseName = step.result;
                // capitalize and set name
                userProfile.name = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.substr(1);
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            // if we have everything we need, greet user and return
            if (userProfile !== undefined && userProfile.beerDrinker !== undefined) {
                return yield this.greetUser(step);
            }
            if (!userProfile.beerDrinker) {
                // prompt for drinking status, if missing
                return yield step.prompt(BEER_DRINKER_PROMPT, {
                    prompt: `Hello ${userProfile.name}! You drink beer, right?`,
                    retryPrompt: 'Sorry, please choose Yes or No',
                    choices: ['Yes', 'No']
                });
            }
            else {
                return yield step.next();
            }
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Having all the data we need, simply display a summary back to the user.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.displayGreetingStateStep = (step) => __awaiter(this, void 0, void 0, function* () {
            // save drinking status, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.beerDrinker === undefined && step.result) {
                // Set drinking status
                userProfile.beerDrinker = step.result.value.toLowerCase() === 'yes' ? true : false;
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            return yield step.next();
        });
        /**
         * Validator function to verify that user name meets required constraints.
         *
         * @param {PromptValidatorContext} validation context for this validator.
         */
        this.validateName = (validatorContext) => __awaiter(this, void 0, void 0, function* () {
            // Validate that the user entered a minimum lenght for their name
            const value = (validatorContext.recognized.value || '').trim();
            if (value.length >= NAME_LENGTH_MIN) {
                return VALIDATION_SUCCEEDED;
            }
            else {
                yield validatorContext.context.sendActivity(`Names need to be at least ${NAME_LENGTH_MIN} characters long.`);
                return VALIDATION_FAILED;
            }
        });
        // validate what was passed in
        if (!dialogId)
            throw ('Missing parameter.  dialogId is required');
        if (!userProfileAccessor)
            throw ('Missing parameter.  userProfileAccessor is required');
        // Add text prompt for name
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(PROFILE_DIALOG, [
            this.initializeStateStep.bind(this),
            this.promptForNameStep.bind(this),
            this.verifyBeerDrinkingStep.bind(this),
            this.displayGreetingStateStep.bind(this),
            this.greetUser.bind(this)
        ]));
        // Add text prompts for name and yes/no prompt for beer drinking
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(NAME_PROMPT, this.validateName));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(BEER_DRINKER_PROMPT));
        // Save off our state accessor for later use
        this.userProfileAccessor = userProfileAccessor;
    }
    /**
     * Helper function to greet user with information in greetingState.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    greetUser(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            // Change user's name based on their drinking status
            const newName = userProfile.beerDrinker ? `Beer-drinking ${userProfile.name}` : `Sober ${userProfile.name}`;
            userProfile.name = newName;
            yield this.userProfileAccessor.set(step.context, userProfile);
            yield step.context.sendActivity(`Awesome! I\'m going to call you ${newName}`);
            yield step.context.sendActivity(`${newName}, if you\'d like me to recommend a beer for you to try, just ask!`);
            return yield step.endDialog();
        });
    }
}
exports.GreetingDialog = GreetingDialog;
//# sourceMappingURL=greeting.js.map