import axios from 'axios';
import { CardFactory, MessageFactory, CardAction } from 'botbuilder';

export class BeerStoreLocator {

  async getBeerStoreLocation(address: string) {
    const latLong = await this.getLatLong(address);
    let response;
    try {
      response = await axios({
        method: 'get',
        url: `https://api.cognitive.microsoft.com/bing/v7.0/entities/?q=beer%20store&mkt=en-us`,
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.cognitiveApiKey,
          'X-Search-Location': `lat:${latLong[0]};long:${latLong[1]};re:5000`
        }
      })
      // Return the data as a place Hero card
      const place = await response.data.places.value[0];
      const placeCard = await this.createPlaceCard(place);
      return MessageFactory.attachment(placeCard)
      // There can be issues with some addresses, so let's at least show a card for the sake of demonstrating functionality
    } catch (err) {
      console.error(err)
      console.error(response.data);
      return MessageFactory.attachment(CardFactory.heroCard(
        'Mock Beer Store',
        'Mock address',
        [],
        []
      ))
    }
  }

  async getLatLong(address: string) {
    address = address.replace(' ', '%20')
    let response;
    try {
      response = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations/q=${address}?o=json&key=${process.env.virtualEarthKey}`);
      const coordinates = await response.data.resourceSets[0].resources[0].point.coordinates;
      return await coordinates
    }
    // There can be issues with some addresses. If we return [null, null] the API used in BeerStoreLocator seems to try to find the user's location by thier IP address
    catch (err) {
      console.error(err);
      console.error(response.data.resourceSets);
      return [null, null]
    }
  }

  createPlaceCard = (place) => {
    const button: CardAction = {
      type: 'openUrl',
      title: 'Website',
      value: place.url
    }
    return CardFactory.heroCard(
      place.name,
      `${place.address.addressLocality}, ${place.address.addressRegion}\n${place.telephone}`,
      [],
      [button]
    );
  }
}