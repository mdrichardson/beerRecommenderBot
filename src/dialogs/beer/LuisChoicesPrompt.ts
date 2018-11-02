import { Activity, TurnContext } from "botbuilder-core";
import { PromptOptions, PromptRecognizerResult, ChoicePrompt, ListStyle, ChoiceFactoryOptions, ChoiceFactory, FoundChoice, FindChoicesOptions, recognizeChoices } from "botbuilder-dialogs";
import { LuisRecognizer } from 'botbuilder-ai';

// This class first attempts to recognize choices using LUIS intents
//    If that fails, it reverts to a regular ChoicePrompt

export class LuisChoicesPrompt extends ChoicePrompt {
  public luisRecognzier;
  public ListStyle;
  public isRetry;
  public intentConverter;

  constructor(dialogId: string, luisRecognizer: LuisRecognizer, intentConverter: Object) {
    super(dialogId);
    this.luisRecognzier = luisRecognizer;
    this.style = ListStyle.none;
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

  protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
    // Format prompt to send
    let prompt: Partial<Activity>;
    const choices: any[] = (this.style === ListStyle.suggestedAction ? ChoiceFactory.toChoices(options.choices) : options.choices) || [];
    const channelId: string = context.activity.channelId;
    const choiceOptions: ChoiceFactoryOptions = this.choiceOptions || undefined;
    if (isRetry && options.retryPrompt) {
        this.isRetry = true;
        this.style = ListStyle.auto;
        prompt = this.appendChoices(options.retryPrompt, channelId, choices, this.style, choiceOptions);
    } else {
        prompt = this.appendChoices(options.prompt, channelId, choices, this.style, choiceOptions);
    }

    // Send prompt
    await context.sendActivity(prompt);
  }

  protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<FoundChoice>> {
    const result: PromptRecognizerResult<FoundChoice> = { succeeded: false };
    const activity: Activity = context.activity;
    const utterance: string = activity.text;
    const choices: any[] = (this.style === ListStyle.suggestedAction ? ChoiceFactory.toChoices(options.choices) : options.choices)|| [];
    const opt: FindChoicesOptions = this.recognizerOptions || {} as FindChoicesOptions;
    let results;
    // If this isn't a retry, look for LUIS intent results. If it IS a retry, look for the normal ChoicePromp results
    if (!this.isRetry) {
      const luisResults = await this.luisRecognzier.recognize(context);
      // Use the intentConverter to convert from the LUIS intent to a text string
      const convertedResult = this.intentConverter[Object.keys(luisResults.intents)[0]]
      // Handle no results
      if (!convertedResult) {
        return result
      } else {
        // Store in the correct format
        results = [{
          resolution: {
            value: convertedResult
          }
        }];
      }
    } else {
      results = recognizeChoices(utterance, choices, opt);
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
        catch(e) { }
    }
    return result;
  }
}