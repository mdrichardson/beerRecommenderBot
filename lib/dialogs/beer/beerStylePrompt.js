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
const botbuilder_core_1 = require("botbuilder-core");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class BeerStylePrompt extends botbuilder_dialogs_1.Prompt {
    constructor(dialogId, luisRecognizer, validator) {
        super(dialogId, validator);
        this.luisRecognzier = luisRecognizer;
    }
    onPrompt(context, state, options, isRetry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isRetry && options.retryPrompt) {
                yield context.sendActivity(options.retryPrompt, undefined, botbuilder_core_1.InputHints.ExpectingInput);
            }
            else if (options.prompt) {
                yield context.sendActivity(options.prompt, undefined, botbuilder_core_1.InputHints.ExpectingInput);
            }
        });
    }
    onRecognize(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = { succeeded: false };
            const activity = context.activity;
            const utterance = activity.text;
            const results = yield this.luisRecognzier.recognize(context);
            console.log(yield results);
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
exports.BeerStylePrompt = BeerStylePrompt;
//# sourceMappingURL=beerStylePrompt.js.map