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
const index_1 = require("./index");
// Beer "database"
const beerDatabase_1 = require("./beerDatabase");
const beerStoreLocator_1 = require("./beerStoreLocator");
// Dialog IDs
const BEER_DIALOG = 'beerDialog';
// Prompt IDs
const STYLE_PROMPT = 'stylePrompt';
const SAMEORSIMILAR_PROMPT = 'sameOrSimilarPrompt';
const BEER_SELECTION_PROMPT = 'beerSelectionPrompt';
const LOCATION_REQUEST_PROMPT = 'locationRequestPrompt';
class BeerDialog extends botbuilder_dialogs_1.ComponentDialog {
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
                yield this.userProfileAccessor.set(step.context, new index_1.UserProfile());
            }
            return yield step.next();
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a choice prompt, get user's favorite beer style
         * Only prompt if we don't have this information already.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForStyle = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            // if we have everything we need, greet user and return
            if (userProfile !== undefined && userProfile.beerStyleFavorite !== undefined) {
                return yield this.promptForSameOrSimilar(step);
            }
            if (!userProfile.beerStyleFavorite) {
                const username = userProfile.name ? userProfile.name : 'friend';
                // prompt for drinking status, if missing
                return yield step.prompt(STYLE_PROMPT, {
                    prompt: `Alright ${username}, what beer style do you like best?`,
                    retryPrompt: 'Sorry, please choose from one of the listed styles',
                    choices: [
                        'Amber',
                        'Blonde',
                        'Brown',
                        'India Pale Ale (IPA)',
                        'Light/Lager',
                        'Pale',
                        'Red',
                        'Porter/Stout',
                        'Wheat/Hefeweizen'
                    ]
                });
            }
            else {
                return yield step.next();
            }
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a choice prompt, see if the user wants to be recommended beer in the
         * Same, Lighter, or Darker style than their favorite
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForSameOrSimilar = (step) => __awaiter(this, void 0, void 0, function* () {
            // save style preferece, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.beerStyleFavorite === undefined && step.result) {
                // Set style preference
                userProfile.beerStyleFavorite = step.result.value;
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            // If user already made their selection, proceed to next step
            if (!userProfile.beerStyleToRecommend) {
                return yield step.prompt(SAMEORSIMILAR_PROMPT, {
                    prompt: `Do you want recommendations in the same style as ${userProfile.beerStyleFavorite},
          something lighter, or something darker?`,
                    retryPrompt: 'Sorry, please choose from one of the listed options',
                    choices: [
                        'Lighter',
                        'Same',
                        'Darker'
                    ]
                });
            }
            else {
                return yield step.next();
            }
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Based off of user's Same/Lighter/Darker selection, set style we're goping to recommend
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.evaluateSameOrSimilar = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (!userProfile.beerStyleToRecommend) {
                const style = userProfile.beerStyleFavorite;
                const adjustment = step.result.value;
                let evaluationMessage;
                const lightnessList = [
                    'Light/Lager',
                    'Pale',
                    'Blonde',
                    'India Pale Ale (IPA)',
                    'Wheat/Hefeweizen',
                    'Amber',
                    'Red',
                    'Brown',
                    'Porter/Stout'
                ];
                // Change recommendation based on whether user selected they want Same, Lighter, or Darker 
                if (adjustment !== 'Same') {
                    // Handle the edge cases
                    if (style === 'Light/Lager' && adjustment === 'Lighter') {
                        evaluationMessage = 'Sorry, but there are no lighter beers than Light/Lager beers.\n' +
                            'I\'ll still recommend **Light/Lager** beers.';
                    }
                    else if (style === 'Porter/Stout' && adjustment === 'Darker') {
                        evaluationMessage = 'Sorry, but there are no darker beers than Porter/Stout beers.\n' +
                            'I\'ll still recommend **Porter/Stout** beers.';
                        // Handle valid Lighter/Darker choices
                    }
                    else {
                        const selectionIndex = lightnessList.indexOf(style);
                        const newIndex = adjustment === 'Lighter' ? selectionIndex - 1 : selectionIndex + 1;
                        evaluationMessage = `Sweet! I'll recommend you some **${lightnessList[newIndex]}** beers.`;
                    }
                    // Handle Same choice
                }
                else {
                    evaluationMessage = `Sweet! I'll recommend you some **${style}** beers.`;
                }
                // save recommended style, if prompted for
                if (userProfile.beerStyleToRecommend === undefined && style) {
                    // Set style preference
                    userProfile.beerStyleToRecommend = style;
                    yield this.userProfileAccessor.set(step.context, userProfile);
                }
                yield step.context.sendActivity(evaluationMessage);
            }
            return yield step.next();
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Displays recommended beers and prompts user to select one
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForBeerSelection = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            // display recommendations
            let beerDB = new beerDatabase_1.BeerDatabase;
            let recommendations = beerDB.displayRecommendations(userProfile.beerStyleToRecommend);
            yield step.context.sendActivity(recommendations);
            return yield step.prompt(BEER_SELECTION_PROMPT, {
                prompt: `Here's your recommendations. Please select one.`,
                retryPrompt: 'Sorry, please choose from one of the listed options',
                choices: beerDB.getRecommendations(userProfile.beerStyleToRecommend),
            });
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a hidden choice prompt, see what kind of beer the user likes
         * Only prompt if we don't have this information already.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForLocationRequest = (step) => __awaiter(this, void 0, void 0, function* () {
            // save beer selection, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.beerSelected === undefined && step.result) {
                // Set selected beer
                userProfile.beerSelected = step.result.value;
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            return yield step.prompt(LOCATION_REQUEST_PROMPT, `**Enter your address** and I\`ll find a nearby craft beer store to you so you can go buy **${userProfile.beerSelected}**`);
        });
        this.provideLocation = (step) => __awaiter(this, void 0, void 0, function* () {
            // save location, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.location === undefined && step.result) {
                // Set selected beer
                userProfile.location = step.result;
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            try {
                let beerStoreLocator = new beerStoreLocator_1.BeerStoreLocator;
                const store = yield beerStoreLocator.getBeerStoreLocation(step.result);
                yield step.context.sendActivity(yield store);
                return yield step.endDialog();
            }
            catch (err) {
                console.error(err);
            }
        });
        // validate what was passed in
        if (!dialogId)
            throw ('Missing parameter.  dialogId is required');
        if (!userProfileAccessor)
            throw ('Missing parameter.  userProfileAccessor is required');
        // Add text prompt for name
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(BEER_DIALOG, [
            this.initializeStateStep.bind(this),
            this.promptForStyle.bind(this),
            this.promptForSameOrSimilar.bind(this),
            this.evaluateSameOrSimilar.bind(this),
            this.promptForBeerSelection.bind(this),
            this.promptForLocationRequest.bind(this),
            this.provideLocation.bind(this)
        ]));
        // Add text prompts for name and yes/no prompt for beer drinking
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(STYLE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(SAMEORSIMILAR_PROMPT));
        const beerSelection = new botbuilder_dialogs_1.ChoicePrompt(BEER_SELECTION_PROMPT);
        beerSelection.style = 0;
        this.addDialog(beerSelection);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(LOCATION_REQUEST_PROMPT));
        // Save off our state accessor for later use
        this.userProfileAccessor = userProfileAccessor;
    }
}
exports.BeerDialog = BeerDialog;
//# sourceMappingURL=beer.js.map