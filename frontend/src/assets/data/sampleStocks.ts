import { CharacterStock, UserPortfolio } from '../../types/Stocks'

export const PLACEHOLDER_PORTFOLIO: UserPortfolio = {
  cash: 10000,
  initialCash: 1000,
  lastChapCash: 950,
  stocks: {}
}

export const PLACEHOLDER_STOCKS: CharacterStock[] = [
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    currentPrice: 5000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVyLPSYjKL6hkVNgX7vnAJ513gRg0-JpmGHw&s',
    ownedCount: 0,
    visibility: 'show',
    popularity: 10,
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    currentPrice: 4000,
    image: 'https://64.media.tumblr.com/1d7bcaaefdc7a7bf2f2dedeeb392348a/731a99f5c0f0adba-d0/s1280x1920/ff075ff7ae7f73ce477318b5715cee8450b1135d.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 9,

  },
  {
    id: 'nami',
    name: 'Nami',
    currentPrice: 3000,
    image: 'https://i.pinimg.com/736x/a3/9b/3c/a39b3c216a4ebc8022f928b3e32a1754.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 5,

  },
  {
    id: 'sanji',
    name: 'Sanji',
    currentPrice: 3500,
    image: 'https://i.pinimg.com/originals/7e/be/41/7ebe41a28e287e66c9a7725142941587.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 4,

  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper',
    currentPrice: 2500,
    image: 'https://i.pinimg.com/736x/82/ee/53/82ee53250f0d9f18e32547a21028fd45.jpg',
    ownedCount: 0,
    visibility: 'show',
    popularity: 11,
  }
];
