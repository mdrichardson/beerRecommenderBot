"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const greeting_1 = require("./dialogs/greeting");
const beer_1 = require("./dialogs/beer");
const WELCOME_MESSAGE = 'Hello! I\'m **beerRecommender**. I can help recommend you new beers to try.';
// Dialog IDs
const GREETING_DIALOG = 'greetingDialog';
const BEER_DIALOG = 'beerDialog';
// State Accessor Properties
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'greetingStateProperty';
// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'beerBot';
// Supported LUIS Intents
const GREETING_INTENT = 'Greeting';
const CANCEL_INTENT = 'Utilities_Cancel';
const HELP_INTENT = 'Utilities_Help';
const NONE_INTENT = 'None';
const RECOMMEND_INTENT = 'getBeerRecommendations';
// Supported LUIS Entities, defined in ./dialogs/greeting/resources/greeting.lu
const USER_NAME_ENTITIES = ['userName', 'userName_paternAny'];
/**
 * Demonstrates the following concepts:
 *  Use LUIS to model Greetings, Help, and Cancel interactions
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *  Handle conversation interruptions
 */
class BasicBot {
    /**
     * Constructs the three pieces necessary for this bot to operate:
     * 1. StatePropertyAccessor for conversation state
     * 2. StatePropertyAccess for user state
     * 3. LUIS client
     * 4. DialogSet to handle our GreetingDialog
     *
     * @param {ConversationState} conversationState property accessor
     * @param {UserState} userState property accessor
     * @param {BotConfiguration} botConfig contents of the .bot file
     */
    constructor(conversationState, userState, botConfig) {
        /**
         * Driver code that does one of the following:
         * 1. Display a welcome MESSAGE upon receiving ConversationUpdate activity
         * 2. Use LUIS to recognize intents for incoming user message
         * 3. Start a greeting dialog
         * 4. Optionally handle Cancel or Help interruptions
         *
         * @param {Context} context turn context from the adapter
         */
        this.onTurn = (context) => __awaiter(this, void 0, void 0, function* () {
            // Handle Message activity type, which is the main activity type for shown within a conversational interface
            // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
            // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
            if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                let dialogResult;
                // Create a dialog context
                const dc = yield this.dialogs.createContext(context);
                // Perform a call to LUIS to retrieve results for the current activity message.
                const results = yield this.luisRecognizer.recognize(context);
                const topIntent = botbuilder_ai_1.LuisRecognizer.topIntent(results);
                // update user profile property with any entities captured by LUIS
                // This could be user responding with their name while we are in the middle of greeting dialog,
                // or user saying something like 'i'm {userName}' while we have no active multi-turn dialog.
                yield this.updateUserProfile(results, context);
                // Based on LUIS topIntent, evaluate if we have an interruption.
                // Interruption here refers to user looking for help/ cancel existing dialog
                const interrupted = yield this.isTurnInterrupted(dc, results);
                if (interrupted) {
                    if (dc.activeDialog !== undefined) {
                        // issue a re-prompt on the active dialog
                        yield dc.repromptDialog();
                    } // Else: We dont have an active dialog so nothing to continue here.
                }
                else {
                    // No interruption. Continue any active dialogs.
                    dialogResult = yield dc.continueDialog();
                }
                // If no active dialog or no active dialog has responded,
                if (!dc.context.responded) {
                    // Switch on return results from any active dialog.
                    switch (dialogResult.status) {
                        // dc.continueDialog() returns DialogTurnStatus.empty if there are no active dialogs
                        case botbuilder_dialogs_1.DialogTurnStatus.empty:
                            // Determine what we should do based on the top intent from LUIS.
                            switch (topIntent) {
                                case GREETING_INTENT:
                                    yield dc.beginDialog(GREETING_DIALOG);
                                    break;
                                case RECOMMEND_INTENT:
                                    yield dc.beginDialog(BEER_DIALOG);
                                    break;
                                case NONE_INTENT:
                                default:
                                    // help or no intent identified, either way, let's provide some help
                                    // to the user
                                    yield dc.context.sendActivity(`I didn't understand what you just said to me.\nTry saying 'hello' or 'give me a beer recommendation'`);
                                    break;
                            }
                            break;
                        case botbuilder_dialogs_1.DialogTurnStatus.waiting:
                            // The active dialog is waiting for a response from the user, so do nothing.
                            break;
                        case botbuilder_dialogs_1.DialogTurnStatus.complete:
                            // All child dialogs have ended. so do nothing.
                            break;
                        default:
                            // Unrecognized status from child dialog. Cancel all dialogs.
                            yield dc.cancelAllDialogs();
                            break;
                    }
                }
            }
            // Handle ConversationUpdate activity type, which is used to indicates new members add to
            // the conversation.
            // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
            else if (context.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate) {
                // Do we have any new members added to the conversation?
                if (context.activity.membersAdded.length !== 0) {
                    // Iterate over all new members added to the conversation
                    for (var idx in context.activity.membersAdded) {
                        // Greet anyone that was not the target (recipient) of this message
                        // the 'bot' is the recipient for events from the channel,
                        // context.activity.membersAdded == context.activity.recipient.Id indicates the
                        // bot was added to the conversation.
                        if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                            // Welcome user.
                            yield context.sendActivity(WELCOME_MESSAGE);
                            // Reset user profile
                            let userProfile = {
                                name: 'friend',
                                beerDrinker: undefined,
                                beerStyleFavorite: undefined,
                                beerStyleToRecommend: undefined,
                                beerSelected: undefined,
                                location: undefined,
                            };
                            yield this.userProfileAccessor.set(context, userProfile);
                        }
                    }
                }
            }
            // make sure to persist state at the end of a turn.
            yield this.conversationState.saveChanges(context);
            yield this.userState.saveChanges(context);
        });
        /**
         * Look at the LUIS results and determine if we need to handle
         * an interruptions due to a Help or Cancel intent
         *
         * @param {DialogContext} dc - dialog context
         * @param {LuisResults} luisResults - LUIS recognizer results
         */
        this.isTurnInterrupted = (dc, luisResults) => __awaiter(this, void 0, void 0, function* () {
            const topIntent = botbuilder_ai_1.LuisRecognizer.topIntent(luisResults);
            // see if there are any conversation interrupts we need to handle
            if (topIntent === CANCEL_INTENT) {
                if (dc.activeDialog) {
                    // cancel all active dialog (clean the stack)
                    yield dc.cancelAllDialogs();
                    yield dc.context.sendActivity(`Ok.  I've cancelled our last activity.`);
                }
                else {
                    yield dc.context.sendActivity(`I don't have anything to cancel.`);
                }
                return true; // this is an interruption
            }
            if (topIntent === HELP_INTENT) {
                yield dc.context.sendActivity(`Let me try to provide some help.`);
                yield dc.context.sendActivity(`I understand greetings, being asked for help, being asked for beer recommendations, or being asked to cancel what I am doing.`);
                return true; // this is an interruption
            }
            return false; // this is not an interruption
        });
        /**
         * Helper function to update user profile with entities returned by LUIS.
         *
         * @param {LuisResults} luisResults - LUIS recognizer results
         * @param {DialogContext} dc - dialog context
         */
        this.updateUserProfile = (luisResult, context) => __awaiter(this, void 0, void 0, function* () {
            // Do we have any entities?
            if (Object.keys(luisResult.entities).length !== 1) {
                // get greetingState object using the accessor
                let userProfile = yield this.userProfileAccessor.get(context);
                if (userProfile === undefined)
                    userProfile = new greeting_1.UserProfile();
                // see if we have any user name entities
                USER_NAME_ENTITIES.forEach(name => {
                    if (luisResult.entities[name] !== undefined) {
                        let lowerCaseName = luisResult.entities[name][0];
                        // capitalize and set user name
                        userProfile.name = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.substr(1);
                    }
                });
                // set the new values
                yield this.userProfileAccessor.set(context, userProfile);
            }
        });
        if (!conversationState)
            throw new Error('Missing parameter.  conversationState is required');
        if (!userState)
            throw new Error('Missing parameter.  userState is required');
        if (!botConfig)
            throw new Error('Missing parameter.  botConfig is required');
        // add the LUIS recogizer
        let luisConfig;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId)
            throw ('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
        this.luisRecognizer = new botbuilder_ai_1.LuisRecognizer({
            applicationId: luisConfig.appId,
            // CAUTION: Its better to assign and use a subscription key instead of authoring key here.
            endpointKey: luisConfig.authoringKey,
            endpoint: luisConfig.getEndpoint()
        });
        // Create the property accessors for user and conversation state
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        // Create top-level dialog(s)
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new greeting_1.GreetingDialog(GREETING_DIALOG, this.userProfileAccessor));
        this.dialogs.add(new beer_1.BeerDialog(BEER_DIALOG, this.userProfileAccessor, this.luisRecognizer));
        this.conversationState = conversationState;
        this.userState = userState;
    }
}
exports.BasicBot = BasicBot;
;
//# sourceMappingURL=bot.js.map