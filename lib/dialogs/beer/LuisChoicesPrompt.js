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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// This class first attempts to recognize choices using LUIS intents
//    If that fails, it reverts to a regular ChoicePrompt
class LuisChoicesPrompt extends botbuilder_dialogs_1.ChoicePrompt {
    constructor(dialogId, luisRecognizer, intentConverter) {
        super(dialogId);
        this.luisRecognzier = luisRecognizer;
        this.style = botbuilder_dialogs_1.ListStyle.none;
        this.isRetry = false;
        this.intentConverter = intentConverter;
        // Intent converter converts LUIS intent to string
        // Example:
        // const beerIntents = {
        //   amberBeer: 'Amber',
        //   blondeBeer: 'Blonde',
        //   brownBeer: 'Brown',
        //   ipaBeer: 'India Pale Ale (IPA)',
        //   lightBeer: 'Wheat/Hefeweizen',
        //   paleBeer: 'Pale',
        //   porterBeer: 'Porter/Stout',
        //   redBeer: 'Red',
        //   wheatBeer: 'Wheat/Hefeweizen'
        // };
    }
    onPrompt(context, state, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            // Format prompt to send
            let prompt;
            const choices = (this.style === botbuilder_dialogs_1.ListStyle.suggestedAction ? botbuilder_dialogs_1.ChoiceFactory.toChoices(options.choices) : options.choices) || [];
            const channelId = context.activity.channelId;
            const choiceOptions = this.choiceOptions || undefined;
            if (isRetry && options.retryPrompt) {
                this.isRetry = true;
                this.style = botbuilder_dialogs_1.ListStyle.auto;
                prompt = this.appendChoices(options.retryPrompt, channelId, choices, this.style, choiceOptions);
            }
            else {
                prompt = this.appendChoices(options.prompt, channelId, choices, this.style, choiceOptions);
            }
            // Send prompt
            yield context.sendActivity(prompt);
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = { succeeded: false };
            const activity = context.activity;
            const utterance = activity.text;
            const choices = (this.style === botbuilder_dialogs_1.ListStyle.suggestedAction ? botbuilder_dialogs_1.ChoiceFactory.toChoices(options.choices) : options.choices) || [];
            const opt = this.recognizerOptions || {};
            let results;
            if (!this.isRetry) {
                const luisResults = yield this.luisRecognzier.recognize(context);
                results = Object.keys(luisResults.intents);
                if (results[0] === 'None') {
                    return results[0];
                }
            }
            else {
                results = botbuilder_dialogs_1.recognizeChoices(utterance, choices, opt);
            }
            if (Array.isArray(results) && results.length > 0) {
                result.succeeded = true;
                result.value = results[0].resolution;
            }
            if (results.length > 0 && results[0].resolution != null) {
                try {
                    result.succeeded = true;
                    result.value = results[0].resolution.value;
                }
                catch (e) { }
            }
            return result;
        });
    }
}
exports.LuisChoicesPrompt = LuisChoicesPrompt;
//# sourceMappingURL=LuisChoicesPrompt.js.map