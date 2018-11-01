// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// greeting.js defines the greeting dialog
import { ComponentDialog, ChoicePrompt,  WaterfallDialog, WaterfallStepContext, ListStyle } from 'botbuilder-dialogs';
import { StatePropertyAccessor } from 'botbuilder';

// User state for greeting dialog
import { UserProfile } from './index';

// Beer "database"
import { BeerDatabase } from './beerDatabase';

// Dialog IDs
const BEER_DIALOG = 'beerDialog';

// Prompt IDs
const STYLE_PROMPT = 'stylePrompt';
const SAMEORSIMILAR_PROMPT = 'sameOrSimilarPrompt';
const BEER_SELECTION_PROMPT = 'beerSelectionPrompt';
const LOCATION_REQUEST_PROMPT = 'locationRequestPrompt';

export class BeerDialog extends ComponentDialog {

  private userProfileAccessor: StatePropertyAccessor<UserProfile>;

  constructor(dialogId: string, userProfileAccessor: StatePropertyAccessor<UserProfile>) {
    super(dialogId);

    // validate what was passed in
    if (!dialogId) throw ('Missing parameter.  dialogId is required');
    if (!userProfileAccessor) throw ('Missing parameter.  userProfileAccessor is required');

    // Add text prompt for name
    this.addDialog(new WaterfallDialog(BEER_DIALOG, [
      this.initializeStateStep.bind(this),
      this.promptForStyle.bind(this),
      this.promptForSameOrSimilar.bind(this),
      this.evaluateSameOrSimilar.bind(this),
      this.promptForBeerSelection.bind(this),
      this.promptForLocationRequest.bind(this)
    ]));
    
    // Add text prompts for name and yes/no prompt for beer drinking
    this.addDialog(new ChoicePrompt(STYLE_PROMPT));
    this.addDialog(new ChoicePrompt(SAMEORSIMILAR_PROMPT));
    const beerSelection = new ChoicePrompt(BEER_SELECTION_PROMPT)
    beerSelection.style = 0
    this.addDialog(beerSelection);
    this.addDialog(new ChoicePrompt(LOCATION_REQUEST_PROMPT));    

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
   * Using a choice prompt, get user's favorite beer style
   * Only prompt if we don't have this information already.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private promptForStyle = async (step: WaterfallStepContext<UserProfile>) => {
    const userProfile = await this.userProfileAccessor.get(step.context);
    // if we have everything we need, greet user and return
    if (userProfile !== undefined && userProfile.beerStyleFavorite !== undefined) {
      return await this.promptForSameOrSimilar(step);
    }
    if (!userProfile.beerStyleFavorite) {
      const username = userProfile.name ? userProfile.name : 'friend';
      // prompt for drinking status, if missing
      return await step.prompt(STYLE_PROMPT, {
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
    } else {
      return await step.next();
    }
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Using a choice prompt, see if the user wants to be recommended beer in the
   * Same, Lighter, or Darker style than their favorite
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private promptForSameOrSimilar = async (step: WaterfallStepContext<UserProfile>) => {
    // save style preferece, if prompted for
    const userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile.beerStyleFavorite === undefined && step.result) {
      // Set style preference
      userProfile.beerStyleFavorite = step.result.value;
      await this.userProfileAccessor.set(step.context, userProfile);
    }
    // If user already made their selection, proceed to next step
    if (!userProfile.beerStyleToRecommend) {
      return await step.prompt(SAMEORSIMILAR_PROMPT, {
        prompt: `Do you want recommendations in the same style as ${userProfile.beerStyleFavorite},
          something lighter, or something darker?`,
        retryPrompt: 'Sorry, please choose from one of the listed options',
        choices: [
          'Lighter',
          'Same',
          'Darker'
        ]
      });
    } else {
      return await step.next();
    }
    
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Based off of user's Same/Lighter/Darker selection, set style we're goping to recommend
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private evaluateSameOrSimilar = async (step: WaterfallStepContext<UserProfile>) => {
    const userProfile = await this.userProfileAccessor.get(step.context);
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
    ]
    // Change recommendation based on whether user selected they want Same, Lighter, or Darker 
    if (adjustment !== 'Same') {
      // Handle the edge cases
      if (style === 'Light/Lager' && adjustment === 'Lighter') {
        evaluationMessage = 'Sorry, but there are no lighter beers than Light/Lager beers.\n' +
          'I\'ll still recommend **Light/Lager** beers.';
      } else if (style === 'Porter/Stout' && adjustment === 'Darker') {
        evaluationMessage = 'Sorry, but there are no darker beers than Porter/Stout beers.\n' +
          'I\'ll still recommend **Porter/Stout** beers.';
      // Handle valid Lighter/Darker choices
      } else {
        const selectionIndex = lightnessList.indexOf(style);
        const newIndex = adjustment === 'Lighter' ? selectionIndex - 1 : selectionIndex + 1;
        evaluationMessage = `Sweet! I'll recommend you some **${lightnessList[newIndex]}** beers.`;
      }
    // Handle Same choice
    } else {
      evaluationMessage = `Sweet! I'll recommend you some **${style}** beers.`;
    }
    // save recommended style, if prompted for
    if (userProfile.beerStyleToRecommend === undefined && style) {
      // Set style preference
      userProfile.beerStyleToRecommend = style;
      await this.userProfileAccessor.set(step.context, userProfile);
    }
    await step.context.sendActivity(evaluationMessage);
    }
    return await step.next();
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Displays recommended beers and prompts user to select one
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private promptForBeerSelection = async (step: WaterfallStepContext<UserProfile>) => {
    const userProfile = await this.userProfileAccessor.get(step.context);
    // Don't save their same or similar choice in case they want to go through recommendation again
    let beerDB:BeerDatabase = new BeerDatabase; 
    let recommendations = beerDB.displayRecommendations(userProfile.beerStyleToRecommend);
    await step.context.sendActivity(recommendations);
    return await step.prompt(BEER_SELECTION_PROMPT, {
      prompt: `Here's your recommendations. Please select one.`,
      retryPrompt: 'Sorry, please choose from one of the listed options',
      choices: beerDB.getRecommendations(userProfile.beerStyleToRecommend),
    });
  }
  /**
   * Waterfall Dialog step functions.
   *
   * Using a hidden choice prompt, see what kind of beer the user likes
   * Only prompt if we don't have this information already.
   *
   * @param {WaterfallStepContext} step contextual information for the current step being executed
   */
  private promptForLocationRequest = async (step: WaterfallStepContext<UserProfile>) => {
    // save beer selection, if prompted for
    const userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile.beerSelected === undefined && step.result) {
      // Set selected beer
      userProfile.beerSelected = step.result.value;
      await this.userProfileAccessor.set(step.context, userProfile);
    }
  } 
}