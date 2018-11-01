"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
// Most info is from https://untappd.com and https://www.beeradvocate.com
const lightBeers = [
    [
        'Budweiser',
        'Budweiser is a medium-bodied, flavorful, crisp American-style lager. Brewed with the best barley malt and a blend of premium hop varieties, it is an icon of core American values like optimism and celebration.',
        ['https://products0.imgix.drizly.com/ci-budweiser-6d2e50f71967161b.jpeg?auto=format%2Ccompress&fm=jpeg&q=20'],
        ['Budweiser']
    ],
    [
        'Corona',
        'Corona is an even-keeled cerveza with fruity-honey aromas and a touch of malt.',
        ['https://www.coronausa.com/img/product-bottle-can-corona-extra.png'],
        ['Corona']
    ],
    [
        'Pabst Blue Ribbon',
        'Pabst Blue Ribbon is an American lager beer sold by Pabst Brewing Company, established in Milwaukee, Wisconsin in 1844 and currently based in Los Angeles.',
        ['https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Pabst_Blue_Ribbon_logo.svg/220px-Pabst_Blue_Ribbon_logo.svg.png'],
        ['Pabst Blue Ribbon']
    ],
];
const paleBeers = [
    [
        'Double Dry Hopped Fort Point Pale Ale',
        'This double dry hopped pale ale contains the same base ingredients, for both malt and hops, as Fort Point Pale Ale, but with an additional dry hop.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-415360_3117e_sm.jpeg'],
        ['Double Dry Hopped Fort Point Pale Ale']
    ],
    [
        'Double Dry Hop Pseudo Sue',
        'This double dry hopped pale ale showcases the Citra hop for a well balanced beer that is delicate in body with a mild bitterness in the finish.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1569952_3f717_sm.jpeg'],
        ['Double Dry Hop Pseudo Sue']
    ],
    [
        'Zombie Dust',
        'This intensely hopped and gushing undead Pale Ale will be one’s only respite after the zombie apocalypse.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-13559_9ce15_sm.jpeg'],
        ['Zombie Dust']
    ],
];
const blondeBeers = [
    [
        'Eureka (w/ Citra)',
        'Eureka w/ Citra explodes with citrus fruit on the nose and the palate, and finishes cleanly with light bits of cracker malt. ',
        ['https://untappd.akamaized.net/site/beer_logos/beer-545798_7cf15_sm.jpeg'],
        ['Eureka (w/ Citra)']
    ],
    [
        'Key Lime Slice',
        'Wedge of the south in a glass!',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1068876_c57d8_sm.jpeg'],
        ['Key Lime Slice']
    ],
    [
        'Good Morning Vietnam',
        'Coffee Vanilla Blonde Made with locally roasted Ethiopian Coffee from our friends at Enderly Coffee Roasters and rich Madagascar Vanilla Beans.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1157584_fd186_sm.jpeg'],
        ['Good Morning Vietnam']
    ],
];
const ipaBeers = [
    [
        'Julius',
        'Bursting with pungent American hops, Julius - our flagship American IPA - is a bright, juicy beer filled with flavors and aromas of mango, peach, passionfruit.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-237985_c70fc_sm.jpeg'],
        ['Julius']
    ],
    [
        'Double Dry Hopped Congress Street IPA',
        'This amplified version of Congress Street IPA is a focused exhibition of the Galaxy Hop.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-785607_ccd33_sm.jpeg'],
        ['Double Dry Hopped Congress Street IPA']
    ],
    [
        'Focal Banger',
        'American IPA with Citra & Mosaic hops.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-45458_e3a3c_sm.jpeg'],
        ['Focal Banger']
    ],
];
const wheatBeers = [
    [
        'Raise the Dead',
        'Raise the Dead is a Broyhan Ale aged in gin barrels and brewed in collaboration with our friend Sebastian from Freigeist Bierkultur. ',
        ['https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png'],
        ['Raise the Dead']
    ],
    [
        'Foudreweizen',
        'Foudreweizen is a farmhouse wheat beer fermented in an oak foudre.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1094779_e562e_sm.jpeg'],
        ['Foudreweizen']
    ],
    [
        'Autumn Range - NZ Hopfen Weisse',
        'NZ hopped hopfen weisse',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1223906_5de05_sm.jpeg'],
        ['Autumn Range - NZ Hopfen Weisse']
    ],
];
const amberBeers = [
    [
        'Zoe',
        'Our take on an American amber ale. Complex malt bill delivers notes of dark raisin, chocolate and biscuit. Copious additions of American hops yield notes of pine and citrus.',
        ['https://cdn.beeradvocate.com/im/c_beer_image.gif'],
        ['Zoe']
    ],
    [
        'Amber Smashed Face',
        'An aggressively hopped American Amber Ale sure to crush your skull and liquefy your brain.',
        ['https://cdn.beeradvocate.com/im/c_beer_image.gif'],
        ['Amber Smashed Face']
    ],
    [
        'Lanthrone',
        'Imperial Amber Ale Aged in Bourbon Barrels.',
        ['https://cdn.beeradvocate.com/im/c_beer_image.gif'],
        ['Lanthrone']
    ],
];
const redBeers = [
    [
        'Slow Riser w/ Bangarang Coffee',
        'Red ale w/ Bangarang Coffee Roasty-Smooth-Percolating',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1894298_88d5c_sm.jpeg'],
        ['Slow Riser w/ Bangarang Coffee']
    ],
    [
        'BBA Wild 10 W/ Blackberry',
        'Bourbon barrel aged sour red with blackerries',
        ['https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png'],
        ['BBA Wild 10 W/ Blackberry']
    ],
    [
        'Foudre Red',
        'Expertly aged in in French Oak Foudres for 6 months and then aged 12 months in Bourbon County barrels.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-2743198_c701c_sm.jpeg'],
        ['Foudre Red']
    ],
];
const brownBeers = [
    [
        'Board Meeting (Pappy Van Winkle Bourbon Barrel Aged)',
        'Ale aged in Pappy Van Winkle bourbon barrels with vanilla, coffee, and cocoa nibs.',
        ['https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png'],
        ['Board Meeting (Pappy Van Winkle Bourbon Barrel Aged)']
    ],
    [
        'Traverse City Whiskey Barrel Aged Jupiter',
        'Oak, bourbon, toffee, spicy, soft vanilla, rich, full.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-1769936_bde6e_sm.jpeg'],
        ['Traverse City Whiskey Barrel Aged Jupiter']
    ],
    [
        'George',
        'George was our grandfather’s brother, and Hill Farmstead Brewery rests upon the land that was once home to him and his 13 siblings. ',
        ['https://untappd.akamaized.net/site/beer_logos/beer-354738_6ff7e_sm.jpeg'],
        ['George']
    ],
];
const porterBeers = [
    [
        'Everett',
        'Everett (1908-1939) was our grandfather’s brother; Hill Farmstead Brewery rests upon the land that was once home to him and his 13 siblings.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-31977_3d62f_sm.jpeg'],
        ['Everett']
    ],
    [
        'Twilight of The Idols',
        'Twilight of the Idols is our Winter Porter. We brew Twilight each Autumn, with a touch of coffee, and age it on a blend of select vanilla beans. ',
        ['https://untappd.akamaized.net/site/beer_logos/beer-_12764_sm_f37426a41d16ef114bedf1faa1d6a8.jpeg'],
        ['Twilight of The Idols']
    ],
    [
        'Double Shot (Costa Rica Santa Rosa)',
        'This batch of Double Shot was brewed with the character of the current season in mind.',
        ['https://untappd.akamaized.net/site/beer_logos/beer-2314447_c2f12_sm.jpeg'],
        ['Double Shot (Costa Rica Santa Rosa)']
    ],
];
const beerStyles = {
    'Light/Lager': lightBeers,
    'Pale': paleBeers,
    'Blonde': blondeBeers,
    'India Pale Ale (IPA)': ipaBeers,
    'Wheat/Hefeweizen': wheatBeers,
    'Amber': amberBeers,
    'Red': redBeers,
    'Brown': brownBeers,
    'Porter/Stout': porterBeers,
};
class BeerDatabase {
    displayRecommendations(style) {
        let beerList = beerStyles[style].map(beer => botbuilder_1.CardFactory.heroCard.apply(this, beer));
        const recommendations = botbuilder_1.MessageFactory.carousel(beerList);
        return recommendations;
    }
    getRecommendations(style) {
        let beerList = beerStyles[style].map(beer => beer[0]);
        return beerList;
    }
}
exports.BeerDatabase = BeerDatabase;
//# sourceMappingURL=beerDatabase.js.map