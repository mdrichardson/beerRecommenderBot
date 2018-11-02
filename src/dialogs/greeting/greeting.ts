// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// greeting.js defines the greeting dialog
import { ComponentDialog, ChoicePrompt, PromptValidatorContext, TextPrompt, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { StatePropertyAccessor } from 'botbuilder';

// User state for greeting dialog
import { UserProfile } from './userProfile';

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
export class GreetingDialog extends ComponentDialog {

  private userProfileAccessor: StatePropertyAccessor<UserProfile>;

  constructor(dialogId: string, userProfileAccessor: StatePropertyAccessor<UserProfile>) {
    super(dialogId);

    // validate what was passed in
    if (!dialogId) throw ('Missing parameter.  dialogId is required');
    if (!userProfileAccessor) throw ('Missing parameter.  userProfileAccessor is required');

    // Add text prompt for name
    this.addDialog(new WaterfallDialog(PROFILE_DIALOG, [
      this.initializeStateStep.bind(this),
      this.promptForNameStep.bind(this),
      this.verifyBeerDrinkingStep.bind(this),
      this.displayGreetingStateStep.bind(this),
      this.greetUser.bind(this)
    ]));
    
    // Add text prompts for name and yes/no prompt for beer drinking
    this.addDialog(new TextPrompt(NAME_PROMPT, this.validateName));
    this.addDialog(new ChoicePrompt(BEER_DRINKER_PROMPT));

    // Save off our state accessor for later use
    this.userProfileAccessor = userProfileAccessor;
  }

  /**
   * Waterfall Dialog step functions.
   *
   * Initialize our state.  See if the WaterfallDialog has state pass to it
   * If not, then just new up an empty UserProfile object
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private initializeStateStep = async (step: WaterfallStepContext<UserProfile>) => {
    const userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile === undefined) {
      await this.userProfileAccessor.set(step.context, new UserProfile());
    }
    return await step.next();
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Using a text prompt, prompt the user for their name.
   * Only prompt if we don't have this information already.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private promptForNameStep = async (step: WaterfallStepContext<UserProfile>) => {
    const userProfile = await this.userProfileAccessor.get(step.context);
    // if we have everything we need, go to the next step
    if (userProfile !== undefined && userProfile.name !== 'friend') {
      return await this.verifyBeerDrinkingStep(step);
    }
    if (userProfile.name === 'friend') {
      // prompt for name, if missing
      return await step.prompt(NAME_PROMPT, 'What should I call you?');
    } else {
      return await step.next();
    }
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Using a choice prompt, see if the user drinks beer
   * Only prompt if we don't have this information already.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private verifyBeerDrinkingStep = async (step: WaterfallStepContext<UserProfile>) => {
    // save name, if prompted for
    const userProfile = await this.userProfileAccessor.get(step.context);''
    if (userProfile.name === 'friend' && step.result) {
      let lowerCaseName = step.result;
      // capitalize and set name
      userProfile.name = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.substr(1);
      await this.userProfileAccessor.set(step.context, userProfile);
    }
    // if we have everything we need, greet user and return
    if (userProfile !== undefined && userProfile.beerDrinker !== undefined) {
      return await this.greetUser(step);
    }
    if (!userProfile.beerDrinker) {
      // prompt for drinking status, if missing
      return await step.prompt(BEER_DRINKER_PROMPT, {
        prompt: `Hello ${userProfile.name}! You drink beer, right?`,
        retryPrompt: 'Sorry, please choose Yes or No',
        choices: ['Yes', 'No']
      });
    } else {
      return await step.next();
    }
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Having all the data we need, simply display a summary back to the user.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private displayGreetingStateStep = async (step: WaterfallStepContext<UserProfile>) => {
    // save drinking status, if prompted for
    const userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile.beerDrinker === undefined && step.result) {
      // Set drinking status
      userProfile.beerDrinker = step.result.value.toLowerCase() === 'yes' ? true : false;
      await this.userProfileAccessor.set(step.context, userProfile);
    }
    return await step.next();
  }
  /**
   * Validator function to verify that user name meets required constraints.
   *
   * @param {PromptValidatorContext} validation context for this validator.
   */
  private validateName = async (validatorContext: PromptValidatorContext<String>) => {
    // Validate that the user entered a minimum lenght for their name
    const value = (validatorContext.recognized.value || '').trim();
    if (value.length >= NAME_LENGTH_MIN) {
      return VALIDATION_SUCCEEDED;
    } else {
      await validatorContext.context.sendActivity(`Names need to be at least ${NAME_LENGTH_MIN} characters long.`);
      return VALIDATION_FAILED;
    }
  }
  /**
   * Helper function to greet user with information in greetingState.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  async greetUser(step: WaterfallStepContext) {
    const userProfile = await this.userProfileAccessor.get(step.context);
    // Change user's name based on their drinking status
    const newName = userProfile.beerDrinker ? `Beer-drinking ${userProfile.name}` : `Sober ${userProfile.name}`;
    userProfile.name = newName;
    await this.userProfileAccessor.set(step.context, userProfile);
    await step.context.sendActivity(`Awesome! I\'m going to call you ${newName}`);
    await step.context.sendActivity(`${newName}, if you\'d like me to recommend a beer for you to try, just ask!`);
    return await step.endDialog();
  }
}
