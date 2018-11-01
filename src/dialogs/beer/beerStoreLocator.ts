import axios from 'axios';
import { CardFactory, MessageFactory, CardAction } from 'botbuilder';

export class BeerStoreLocator {

  async getBeerStoreLocation(address: string) {
    try {
      const response = await axios({
        method: 'get',
        url: `https://api.cognitive.microsoft.com/bing/v7.0/entities/?q=craft%20beer%20store%20near%20${address}&mkt=en-US&count=1`,
        headers: {
          'Ocp-Apim-Subscription-Key': '577f7a26406b48f4bb769cf8432ad539'
        }
      })
      const place = await response.data.places.value[0];
      const placeCard = await this.createPlaceCard(place);
      return MessageFactory.attachment(placeCard)
    } catch (err) {
      console.error(err)
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