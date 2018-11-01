import axios from 'axios';
import { CardFactory, MessageFactory, CardAction } from 'botbuilder';

export class BeerStoreLocator {

  async getBeerStoreLocation(address: string) {
    const latLong = await this.getLatLong(address);
    const data = {
      latitude: latLong[0],
      longitute: latLong[1],
      radius: 5000
    }
    let response;
    try {
      response = await axios({
        method: 'get',
        url: `https://api.cognitive.microsoft.com/bing/v7.0/entities/?q=craft%20beer%20store%&mkt=en-US&count=1`,
        headers: {
          'Ocp-Apim-Subscription-Key': '577f7a26406b48f4bb769cf8432ad539'
        },
        data: JSON.stringify(data)
      })
      // Return the data as a place Hero card
      const place = await response.data.places.value[0];
      const placeCard = await this.createPlaceCard(place);
      return MessageFactory.attachment(placeCard)
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
      response = await axios.get(`http://dev.virtualearth.net/REST/v1/Locations/1%20${address}?o=json&key=Ar9ZMo4JOIeFIQaxXACuvnIEAVMZ5ustcBNmYt6oiFT6LEWN5xLWs2WMIPoIZw5v`);
      const coordinates = await response.data.resourceSets[0].resources[0].point.coordinates;
      return await coordinates
    }
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