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
const axios_1 = require("axios");
const botbuilder_1 = require("botbuilder");
class BeerStoreLocator {
    constructor() {
        this.createPlaceCard = (place) => {
            const button = {
                type: 'openUrl',
                title: 'Website',
                value: place.url
            };
            return botbuilder_1.CardFactory.heroCard(place.name, `${place.address.addressLocality}, ${place.address.addressRegion}\n${place.telephone}`, [], [button]);
        };
    }
    getBeerStoreLocation(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const latLong = yield this.getLatLong(address);
            let response;
            try {
                response = yield axios_1.default({
                    method: 'get',
                    url: `https://api.cognitive.microsoft.com/bing/v7.0/entities/?q=beer%20store&mkt=en-us`,
                    headers: {
                        'Ocp-Apim-Subscription-Key': process.env.cognitiveApiKey,
                        'X-Search-Location': `lat:${latLong[0]};long:${latLong[1]};re:5000`
                    }
                });
                // Return the data as a place Hero card
                const place = yield response.data.places.value[0];
                const placeCard = yield this.createPlaceCard(place);
                return botbuilder_1.MessageFactory.attachment(placeCard);
                // There can be issues with some addresses, so let's at least show a card for the sake of demonstrating functionality
            }
            catch (err) {
                console.error(err);
                console.error(response.data);
                return botbuilder_1.MessageFactory.attachment(botbuilder_1.CardFactory.heroCard('Mock Beer Store', 'Mock address', [], []));
            }
        });
    }
    getLatLong(address) {
        return __awaiter(this, void 0, void 0, function* () {
            address = address.replace(' ', '%20');
            let response;
            try {
                response = yield axios_1.default.get(`http://dev.virtualearth.net/REST/v1/Locations/q=${address}?o=json&key=${process.env.virtualEarthKey}`);
                const coordinates = yield response.data.resourceSets[0].resources[0].point.coordinates;
                return yield coordinates;
            }
            // There can be issues with some addresses. If we return [null, null] the API used in BeerStoreLocator seems to try to find the user's location by thier IP address
            catch (err) {
                console.error(err);
                console.error(response.data.resourceSets);
                return [null, null];
            }
        });
    }
}
exports.BeerStoreLocator = BeerStoreLocator;
//# sourceMappingURL=beerStoreLocator.js.map