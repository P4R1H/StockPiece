import { CharacterStock, UserPortfolio } from '../../types/Stocks'

export const PLACEHOLDER_PORTFOLIO: UserPortfolio = {
  username: 'Guest Pirate',
  cash: 0,
  stocks: [],
  isLoggedIn: false,
  profit: 0,
  stockValue: 0
}

export const PLACEHOLDER_STOCKS: CharacterStock[] = [
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    currentPrice: 5000,
    initialValue: 100,
    image: 'https://res.cloudinary.com/cloudkaami/image/upload/v1738315479/r97iczttf3dtpxdn21nt.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 10,
    tickerSymbol: 'LFY',
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    currentPrice: 4000,
    initialValue: 100,
    image: 'https://64.media.tumblr.com/1d7bcaaefdc7a7bf2f2dedeeb392348a/731a99f5c0f0adba-d0/s1280x1920/ff075ff7ae7f73ce477318b5715cee8450b1135d.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 9,
    tickerSymbol: 'ZRO',

  },
  {
    id: 'nami',
    name: 'Nami',
    currentPrice: 3000,
    initialValue: 100,
    image: 'https://i.pinimg.com/736x/a3/9b/3c/a39b3c216a4ebc8022f928b3e32a1754.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 5,
    tickerSymbol: 'NMI',

  },
  {
    id: 'sanji',
    name: 'Sanji',
    currentPrice: 3500,
    initialValue: 100,
    image: 'https://i.pinimg.com/originals/7e/be/41/7ebe41a28e287e66c9a7725142941587.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 4,
    tickerSymbol: 'VSJ',

  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper',
    currentPrice: 2500,
    initialValue: 100,
    image: 'https://i.pinimg.com/736x/82/ee/53/82ee53250f0d9f18e32547a21028fd45.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 11,
    tickerSymbol: 'CPR',

  },
  {
    id: 'usopp',
    name: 'Usopp',
    currentPrice: 2700,
    image: 'https://res.cloudinary.com/cloudkaami/image/upload/v1738398433/vtljxx2zufjon6rqu7js.jpg',
    ownedCount: 0,
    visibility: 'show',
    initialValue: 100,
    popularity: 6,
    tickerSymbol: 'USP',

  },
  {
    id: 'franky',
    name: 'Franky',
    currentPrice: 3200,
    image: 'https://res.cloudinary.com/cloudkaami/image/upload/v1738398228/yuykwuikmjmf7vwwdyub.jpg',
    ownedCount: 0,
    visibility: 'show',
    initialValue: 100,
    popularity: 7,
    tickerSymbol: 'FRY',
  },
  {
    id: 'brook',
    name: 'Brook',
    currentPrice: 2800,
    image: 'https://res.cloudinary.com/cloudkaami/image/upload/v1738398477/lmspfq6gdhqoiizcudin.jpg',
    ownedCount: 0,
    visibility: 'show',
    initialValue: 100,
    popularity: 8,
    tickerSymbol: 'BRK',

  },
  {
    id: 'jinbe',
    name: 'Jinbe',
    currentPrice: 3100,
    image: 'https://res.cloudinary.com/cloudkaami/image/upload/v1738397949/nnbcb0gr2fghgmxz96cb.jpg',
    ownedCount: 0,
    visibility: 'show',
    initialValue: 100,
    tickerSymbol: 'JNB',

    popularity: 6,
  },
  {
    id: 'robin',
    name: 'Nico Robin',
    currentPrice: 3300,
    image: 'https://res.cloudinary.com/cloudkaami/image/upload/v1738398372/qrcatm0nomdc2795w2c1.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 9,
    initialValue: 100,
    tickerSymbol: 'RBN',


  }
];
