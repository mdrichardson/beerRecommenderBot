// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Simple object used by the user state property accessor.
 * Used to store the user state.
 */
class UserProfile {
  // member variables
  public name: string;
  public beerDrinker: boolean;
  public beerStyleFavorite: string;
  public beerStyleToRecommend: string;
  public beerSelected: string;

  /**
   * Constructor. Members initialized with undefined,
   *  if no values provided via constructor
   *
   * @param name string
   * @param beerDrinker boolean
   * @param beerStyleFavorite string
   * @param beerStyleToRecommend string
   * @param beerSelected string
   */
  constructor(
    name?: string,
    beerDrinker?: boolean,
    beerStyleFavorite?: string,
    beerStyleToRecommend?: string,
    beerSelected?: string,
    ) {
    this.name = name || undefined;
    this.beerDrinker = beerDrinker || undefined;
    this.beerStyleFavorite = beerStyleFavorite || undefined;
    this.beerStyleToRecommend = beerStyleToRecommend || undefined;
    this.beerSelected = beerSelected || undefined;
  }
};

export { UserProfile };