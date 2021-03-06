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
const LuisChoicesPrompt_1 = require("./LuisChoicesPrompt");
// Dialog IDs
const BEER_DIALOG = 'beerDialog';
// Prompt IDs
const STYLE_PROMPT = 'stylePrompt';
const SAMEORSIMILAR_PROMPT = 'sameOrSimilarPrompt';
const BEER_SELECTION_PROMPT = 'beerSelectionPrompt';
const LOCATION_REQUEST_PROMPT = 'locationRequestPrompt';
const RESTART_PROMPT = 'restartPrompt';
class BeerDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, userProfileAccessor, luisRecognizer) {
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
                    prompt: `Alright ${username}, describe your favorite beer to me. What kind of color, flavor, aroma, and body does it have?`,
                    retryPrompt: 'Hmm...that doesn\'t seem to match anything I\'m familiar with.\n Please **choose one of the options listed**.',
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
                userProfile.beerStyleFavorite = step.result || step.result.value;
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            // If user already made their selection, proceed to next step
            if (!userProfile.beerStyleToRecommend) {
                return yield step.prompt(SAMEORSIMILAR_PROMPT, {
                    prompt: `Sounds like you prefer the **${userProfile.beerStyleFavorite}** style.\nAm I right on, or would you like me to recommend something a little lighter or darker?`,
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
                let style = userProfile.beerStyleFavorite;
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
                        style = lightnessList[newIndex];
                        evaluationMessage = `Sweet! I'll recommend you some **${style}** beers.`;
                    }
                    // Handle Same choice
                }
                else {
                    evaluationMessage = `Awesome! I'll recommend you some **${style}** beers.`;
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
            if (!userProfile.location) {
                return yield step.prompt(LOCATION_REQUEST_PROMPT, `**Enter your address** and I\`ll find a nearby craft beer store to you so you can go buy **${userProfile.beerSelected}**`);
            }
            return yield step.next();
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Display a hero card of a nearby craft beer store
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.provideLocation = (step) => __awaiter(this, void 0, void 0, function* () {
            // save location, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.location === undefined && step.result) {
                // Set selected beer
                userProfile.location = step.result;
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            let beerStoreLocator = new beerStoreLocator_1.BeerStoreLocator;
            const store = yield beerStoreLocator.getBeerStoreLocation(userProfile.location);
            yield step.context.sendActivity(store);
            return yield step.next();
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Displays recommended beers and prompts user to select one
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForRestart = (step) => __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt(BEER_SELECTION_PROMPT, {
                prompt: 'Now that we\'ve found your recommended beer and where to get it, **do you want to try again with a new recommendation?**',
                retryPrompt: 'Sorry, please choose Yes or No',
                choices: ['Yes', 'No'],
            });
        });
        /**
         *
         * Resets user beer-related profile data if necessary
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.resetIfNecessary = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (step.result.value.toLowerCase() === 'yes') {
                userProfile.beerStyleFavorite = undefined;
                userProfile.beerStyleToRecommend = undefined;
                userProfile.beerSelected = undefined;
                yield step.context.sendActivity(`Alright ${userProfile.name}, your beer preferences reset. Feel free to ask me for another recommendation!`);
            }
            else {
                yield step.context.sendActivity(`No problem, ${userProfile.name}. I\'ll save your preferences.`);
            }
            return yield step.endDialog();
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
            this.provideLocation.bind(this),
            this.promptForRestart.bind(this),
            this.resetIfNecessary.bind(this)
        ]));
        this.luisRecognizer = luisRecognizer;
        // for special LuisChoicesPromp Dialog
        const beerIntents = {
            amberBeer: 'Amber',
            blondeBeer: 'Blonde',
            brownBeer: 'Brown',
            ipaBeer: 'India Pale Ale (IPA)',
            lightBeer: 'Wheat/Hefeweizen',
            paleBeer: 'Pale',
            porterBeer: 'Porter/Stout',
            redBeer: 'Red',
            wheatBeer: 'Wheat/Hefeweizen'
        };
        // Add prompts to Waterfall
        this.addDialog(new LuisChoicesPrompt_1.LuisChoicesPrompt(STYLE_PROMPT, this.luisRecognizer, beerIntents));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(SAMEORSIMILAR_PROMPT));
        // I didn't see a good way to show cards and use those in a choice prompt, so we use a separate function to
        //  show cards and then the prompt just doesn't show the cards
        //  In hindsight, I could create a separate class like I did with the LuisChoicesPromp that does this
        const beerSelection = new botbuilder_dialogs_1.ChoicePrompt(BEER_SELECTION_PROMPT);
        beerSelection.style = 0;
        this.addDialog(beerSelection);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(LOCATION_REQUEST_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(RESTART_PROMPT));
        // Save off our state accessor for later use
        this.userProfileAccessor = userProfileAccessor;
    }
}
exports.BeerDialog = BeerDialog;
//# sourceMappingURL=beer.js.map