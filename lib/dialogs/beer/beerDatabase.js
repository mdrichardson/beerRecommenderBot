"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
// Most info is from https://untappd.com and https://www.beeradvocate.com
const lightBeers = [
    [
        'Budweiser',
        'Budweiser is a medium-bodied, flavorful, crisp American-style lager. Brewed with the best barley malt and a blend of premium hop varieties, it is an icon of core American values like optimism and celebration.',
        ['https://untappd.akamaized.net/photo/2017_10_27/1ccf40504657304537d4803827527b73_320x320.jpg'],
        ['Budweiser']
    ],
    [
        'Corona',
        'Corona is an even-keeled cerveza with fruity-honey aromas and a touch of malt.',
        ['https://untappd.akamaized.net/photo/2016_04_07/4b5e9371b859e59780a9fe72a82e49c2_320x320.jpg'],
        ['Corona']
    ],
    [
        'Pabst Blue Ribbon',
        'Pabst Blue Ribbon is an American lager beer sold by Pabst Brewing Company, established in Milwaukee, Wisconsin in 1844 and currently based in Los Angeles.',
        ['https://untappd.akamaized.net/photo/2017_10_28/29b05f570b477885e3a7338c9395deae_320x320.jpg'],
        ['Pabst Blue Ribbon']
    ],
];
const paleBeers = [
    [
        'Double Dry Hopped Fort Point Pale Ale',
        'This double dry hopped pale ale contains the same base ingredients, for both malt and hops, as Fort Point Pale Ale, but with an additional dry hop.',
        ['https://untappd.akamaized.net/photo/2017_09_13/2e25f69789207453d0440899cf402fed_320x320.jpg'],
        ['Double Dry Hopped Fort Point Pale Ale']
    ],
    [
        'Double Dry Hop Pseudo Sue',
        'This double dry hopped pale ale showcases the Citra hop for a well balanced beer that is delicate in body with a mild bitterness in the finish.',
        ['https://untappd.akamaized.net/photos/2018_03_02/b7f809bc674074b7e1794a7fbda3441b_320x320.jpeg'],
        ['Double Dry Hop Pseudo Sue']
    ],
    [
        'Zombie Dust',
        'This intensely hopped and gushing undead Pale Ale will be one’s only respite after the zombie apocalypse.',
        ['https://untappd.akamaized.net/photo/2015_05_02/cb6ad0be73d1ade0fe79a27e1f641113_320x320.jpg'],
        ['Zombie Dust']
    ],
];
const blondeBeers = [
    [
        'Eureka (w/ Citra)',
        'Eureka w/ Citra explodes with citrus fruit on the nose and the palate, and finishes cleanly with light bits of cracker malt. ',
        ['https://untappd.akamaized.net/photo/2016_02_13/dd61b3ed79fe34b80483e021fa082325_320x320.jpg'],
        ['Eureka (w/ Citra)']
    ],
    [
        'Key Lime Slice',
        'Wedge of the south in a glass!',
        ['https://untappd.akamaized.net/photos/2018_02_16/3afeceb69a09c621a76db5eb7e1cd1b9_320x320.jpg'],
        ['Key Lime Slice']
    ],
    [
        'Good Morning Vietnam',
        'Coffee Vanilla Blonde Made with locally roasted Ethiopian Coffee from our friends at Enderly Coffee Roasters and rich Madagascar Vanilla Beans.',
        ['https://untappd.akamaized.net/photos/2018_04_20/1cf3f66396212827a1810be46fd50b8a_320x320.jpg'],
        ['Good Morning Vietnam']
    ],
];
const ipaBeers = [
    [
        'Julius',
        'Bursting with pungent American hops, Julius - our flagship American IPA - is a bright, juicy beer filled with flavors and aromas of mango, peach, passionfruit.',
        ['https://untappd.akamaized.net/photo/2017_03_26/2153d55006a50178827464f5b5936a38_320x320.jpg'],
        ['Julius']
    ],
    [
        'Double Dry Hopped Congress Street IPA',
        'This amplified version of Congress Street IPA is a focused exhibition of the Galaxy Hop.',
        ['https://untappd.akamaized.net/photo/2017_09_08/260b62256ed5281248f07160e82680d3_320x320.jpeg'],
        ['Double Dry Hopped Congress Street IPA']
    ],
    [
        'Focal Banger',
        'American IPA with Citra & Mosaic hops.',
        ['https://untappd.akamaized.net/photos/2018_01_25/8daeb5be0d4a81214062ac9d522d9a2a_320x320.jpg'],
        ['Focal Banger']
    ],
];
const wheatBeers = [
    [
        'Raise the Dead',
        'Raise the Dead is a Broyhan Ale aged in gin barrels and brewed in collaboration with our friend Sebastian from Freigeist Bierkultur. ',
        ['https://untappd.akamaized.net/photo/2017_05_21/68652e351d3eecc5937f4c7092539f76_320x320.jpg'],
        ['Raise the Dead']
    ],
    [
        'Foudreweizen',
        'Foudreweizen is a farmhouse wheat beer fermented in an oak foudre.',
        ['https://untappd.akamaized.net/photos/2018_04_12/795dcee0f44f14e59b8cda89732eccd1_320x320.jpeg'],
        ['Foudreweizen']
    ],
    [
        'Autumn Range - NZ Hopfen Weisse',
        'NZ hopped hopfen weisse',
        ['https://untappd.akamaized.net/photo/2016_05_02/77c8412b994fa7e0d18d854f03495ec4_320x320.jpg'],
        ['Autumn Range - NZ Hopfen Weisse']
    ],
];
const amberBeers = [
    [
        'Zoe',
        'Our take on an American amber ale. Complex malt bill delivers notes of dark raisin, chocolate and biscuit. Copious additions of American hops yield notes of pine and citrus.',
        ['https://untappd.akamaized.net/photos/2018_01_31/535d25c1c5f5b33ef86d1e0d1c4d1c45_320x320.jpg'],
        ['Zoe']
    ],
    [
        'Amber Smashed Face',
        'An aggressively hopped American Amber Ale sure to crush your skull and liquefy your brain.',
        ['https://untappd.akamaized.net/photo/2016_01_08/2178f2e2e0757199dca3830905d5a58b_320x320.jpg'],
        ['Amber Smashed Face']
    ],
    [
        'Lanthrone',
        'Imperial Amber Ale Aged in Bourbon Barrels.',
        ['https://untappd.akamaized.net/photos/2018_03_04/46339f347e9ee97ffccdac8a2ac4d397_320x320.jpg'],
        ['Lanthrone']
    ],
];
const redBeers = [
    [
        'Slow Riser w/ Bangarang Coffee',
        'Red ale w/ Bangarang Coffee Roasty-Smooth-Percolating',
        ['https://untappd.akamaized.net/photo/2017_10_13/42dff6bb1980e1ddec2d60644638c85d_320x320.jpeg'],
        ['Slow Riser w/ Bangarang Coffee']
    ],
    [
        'BBA Wild 10 W/ Blackberry',
        'Bourbon barrel aged sour red with blackerries',
        ['https://untappd.akamaized.net/photos/2018_03_28/67a2f453a3f8e8f85e374f42b496f9cf_320x320.jpg'],
        ['BBA Wild 10 W/ Blackberry']
    ],
    [
        'Foudre Red',
        'Expertly aged in in French Oak Foudres for 6 months and then aged 12 months in Bourbon County barrels.',
        ['https://untappd.akamaized.net/photo/2015_01_15/439420a2e9331be34761ca9a216a3cf1_320x320.jpg'],
        ['Foudre Red']
    ],
];
const brownBeers = [
    [
        'Board Meeting (Pappy Van Winkle Bourbon Barrel Aged)',
        'Ale aged in Pappy Van Winkle bourbon barrels with vanilla, coffee, and cocoa nibs.',
        ['https://untappd.akamaized.net/photos/2018_02_24/5715e57cbf6a7147af2c6cd37134b2c8_320x320.jpg'],
        ['Board Meeting (Pappy Van Winkle Bourbon Barrel Aged)']
    ],
    [
        'Traverse City Whiskey Barrel Aged Jupiter',
        'Oak, bourbon, toffee, spicy, soft vanilla, rich, full.',
        ['https://untappd.akamaized.net/photos/2018_03_22/c3745db1bb493ac0e82735d829659056_320x320.jpeg'],
        ['Traverse City Whiskey Barrel Aged Jupiter']
    ],
    [
        'George',
        'George was our grandfather’s brother, and Hill Farmstead Brewery rests upon the land that was once home to him and his 13 siblings. ',
        ['https://untappd.akamaized.net/photos/2018_04_21/90e2237cc2ef68147768fd94841f54ad_320x320.jpeg'],
        ['George']
    ],
];
const porterBeers = [
    [
        'Everett',
        'Everett (1908-1939) was our grandfather’s brother; Hill Farmstead Brewery rests upon the land that was once home to him and his 13 siblings.',
        ['https://untappd.akamaized.net/photo/2017_12_25/69ccc63d7dd0f4ee3c443f1291f64e99_320x320.jpg'],
        ['Everett']
    ],
    [
        'Twilight of The Idols',
        'Twilight of the Idols is our Winter Porter. We brew Twilight each Autumn, with a touch of coffee, and age it on a blend of select vanilla beans. ',
        ['https://untappd.akamaized.net/photos/2018_01_28/ba3b0bebf0f7dc115f00e255259513af_320x320.jpg'],
        ['Twilight of The Idols']
    ],
    [
        'Double Shot (Costa Rica Santa Rosa)',
        'This batch of Double Shot was brewed with the character of the current season in mind.',
        ['https://untappd.akamaized.net/photo/2017_11_21/1e7b940c34053c14969320c67f192925_320x320.jpeg'],
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