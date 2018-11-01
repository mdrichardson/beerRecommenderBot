"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple object used by the user state property accessor.
 * Used to store the user state.
 */
class UserProfile {
    /**
     * Constructor. Members initialized with undefined,
     *  if no values provided via constructor
     *
     * @param name string
     * @param beerDrinker boolean
     * @param beerStyleFavorite string
     * @param beerStyleToRecommend string
     * @param beerSelected string
     * @param location string
     */
    constructor(name, beerDrinker, beerStyleFavorite, beerStyleToRecommend, beerSelected, location) {
        this.name = name || undefined;
        this.beerDrinker = beerDrinker || undefined;
        this.beerStyleFavorite = beerStyleFavorite || undefined;
        this.beerStyleToRecommend = beerStyleToRecommend || undefined;
        this.beerSelected = beerSelected || undefined;
        this.location = location || undefined;
    }
}
exports.UserProfile = UserProfile;
;
//# sourceMappingURL=userProfile.js.map