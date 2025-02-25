import { CharacterStock, UserPortfolio } from '../../types/Stocks'

export const PLACEHOLDER_PORTFOLIO: UserPortfolio = {
  username: 'Guest Pirate',
  cash: 10000,
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
    ownedCount: 0,
    visibility: 'show',
    popularity: 11,
    tickerSymbol: 'CPR',

  },
  {
    id: 'usopp',
    name: 'Usopp',
    currentPrice: 2700,
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
    ownedCount: 0,
    visibility: 'show',
    popularity: 9,
    initialValue: 100,
    tickerSymbol: 'RBN',


  }
];
