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
  public beerStyle: string;
  /**
   * Constructor. Members initialized with undefined,
   *  if no values provided via constructor
   *
   * @param name string
   * @param beerDrinker boolean
   * @param beerStyle string
   */
  constructor(name?: string, beerDrinker?: boolean, beerStyle?: string) {
    this.name = name || undefined;
    this.beerDrinker = beerDrinker || undefined;
    this.beerStyle = beerStyle || undefined;
  }
};

export { UserProfile };