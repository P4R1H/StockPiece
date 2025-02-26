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


export const mockHistory : Record<string, { chapter: number, value: number }[]> = {
  "67bf1905d22d690a23cc0090": [
    {
      "chapter": 1,
      "value": 2084
    },
    {
      "chapter": 2,
      "value": 2139
    },
    {
      "chapter": 3,
      "value": 2245
    },
    {
      "chapter": 4,
      "value": 2517
    },
    {
      "chapter": 5,
      "value": 2881
    },
    {
      "chapter": 6,
      "value": 3276
    },
    {
      "chapter": 7,
      "value": 3660
    },
    {
      "chapter": 8,
      "value": 3949
    },
    {
      "chapter": 9,
      "value": 4247
    },
    {
      "chapter": 10,
      "value": 4761
    },
    {
      "chapter": 11,
      "value": 4975
    },
    {
      "chapter": 12,
      "value": 4948
    },
    {
      "chapter": 13,
      "value": 4701
    },
    {
      "chapter": 14,
      "value": 4256
    },
    {
      "chapter": 15,
      "value": 4272
    },
    {
      "chapter": 16,
      "value": 3957
    },
    {
      "chapter": 17,
      "value": 3560
    },
    {
      "chapter": 18,
      "value": 3098
    },
    {
      "chapter": 19,
      "value": 2945
    },
    {
      "chapter": 20,
      "value": 3104
    }
  ],
  "67bf310b55de5bcdb371c706": [
    {
      "chapter": 1,
      "value": 2057
    },
    {
      "chapter": 2,
      "value": 2229
    },
    {
      "chapter": 3,
      "value": 2449
    },
    {
      "chapter": 4,
      "value": 2665
    },
    {
      "chapter": 5,
      "value": 2985
    },
    {
      "chapter": 6,
      "value": 3406
    },
    {
      "chapter": 7,
      "value": 3890
    },
    {
      "chapter": 8,
      "value": 4416
    },
    {
      "chapter": 9,
      "value": 4671
    },
    {
      "chapter": 10,
      "value": 4892
    },
    {
      "chapter": 11,
      "value": 5074
    },
    {
      "chapter": 12,
      "value": 5422
    },
    {
      "chapter": 13,
      "value": 5051
    },
    {
      "chapter": 14,
      "value": 5041
    },
    {
      "chapter": 15,
      "value": 4615
    },
    {
      "chapter": 16,
      "value": 4414
    },
    {
      "chapter": 17,
      "value": 4272
    },
    {
      "chapter": 18,
      "value": 3830
    },
    {
      "chapter": 19,
      "value": 3732
    },
    {
      "chapter": 20,
      "value": 3881
    }
  ],
  "67bf312255de5bcdb371c713": [
    {
      "chapter": 1,
      "value": 2064
    },
    {
      "chapter": 2,
      "value": 2102
    },
    {
      "chapter": 3,
      "value": 2280
    },
    {
      "chapter": 4,
      "value": 2549
    },
    {
      "chapter": 5,
      "value": 2784
    },
    {
      "chapter": 6,
      "value": 2968
    },
    {
      "chapter": 7,
      "value": 3171
    },
    {
      "chapter": 8,
      "value": 3507
    },
    {
      "chapter": 9,
      "value": 3882
    },
    {
      "chapter": 10,
      "value": 3674
    },
    {
      "chapter": 11,
      "value": 3860
    },
    {
      "chapter": 12,
      "value": 3395
    },
    {
      "chapter": 13,
      "value": 3122
    },
    {
      "chapter": 14,
      "value": 3255
    },
    {
      "chapter": 15,
      "value": 3170
    },
    {
      "chapter": 16,
      "value": 3101
    },
    {
      "chapter": 17,
      "value": 2978
    },
    {
      "chapter": 18,
      "value": 2651
    },
    {
      "chapter": 19,
      "value": 2285
    },
    {
      "chapter": 20,
      "value": 2368
    }
  ],
  "67bf313955de5bcdb371c720": [
    {
      "chapter": 1,
      "value": 2003
    },
    {
      "chapter": 2,
      "value": 2148
    },
    {
      "chapter": 3,
      "value": 2316
    },
    {
      "chapter": 4,
      "value": 2522
    },
    {
      "chapter": 5,
      "value": 2776
    },
    {
      "chapter": 6,
      "value": 3089
    },
    {
      "chapter": 7,
      "value": 3443
    },
    {
      "chapter": 8,
      "value": 3738
    },
    {
      "chapter": 9,
      "value": 4049
    },
    {
      "chapter": 10,
      "value": 4501
    },
    {
      "chapter": 11,
      "value": 4646
    },
    {
      "chapter": 12,
      "value": 4717
    },
    {
      "chapter": 13,
      "value": 4878
    },
    {
      "chapter": 14,
      "value": 5136
    },
    {
      "chapter": 15,
      "value": 4446
    },
    {
      "chapter": 16,
      "value": 4163
    },
    {
      "chapter": 17,
      "value": 3556
    },
    {
      "chapter": 18,
      "value": 3263
    },
    {
      "chapter": 19,
      "value": 2938
    },
    {
      "chapter": 20,
      "value": 2583
    }
  ],
  "67bf33a955de5bcdb371c7b8": [
    {
      "chapter": 1,
      "value": 2040
    },
    {
      "chapter": 2,
      "value": 2212
    },
    {
      "chapter": 3,
      "value": 2406
    },
    {
      "chapter": 4,
      "value": 2671
    },
    {
      "chapter": 5,
      "value": 2862
    },
    {
      "chapter": 6,
      "value": 3278
    },
    {
      "chapter": 7,
      "value": 3490
    },
    {
      "chapter": 8,
      "value": 3862
    },
    {
      "chapter": 9,
      "value": 4090
    },
    {
      "chapter": 10,
      "value": 4316
    },
    {
      "chapter": 11,
      "value": 4212
    },
    {
      "chapter": 12,
      "value": 4617
    },
    {
      "chapter": 13,
      "value": 4863
    },
    {
      "chapter": 14,
      "value": 5026
    },
    {
      "chapter": 15,
      "value": 4957
    },
    {
      "chapter": 16,
      "value": 4632
    },
    {
      "chapter": 17,
      "value": 4214
    },
    {
      "chapter": 18,
      "value": 3693
    },
    {
      "chapter": 19,
      "value": 3371
    },
    {
      "chapter": 20,
      "value": 3054
    }
  ],
  "67bf33bd55de5bcdb371c7c5": [
    {
      "chapter": 1,
      "value": 2094
    },
    {
      "chapter": 2,
      "value": 2193
    },
    {
      "chapter": 3,
      "value": 2253
    },
    {
      "chapter": 4,
      "value": 2370
    },
    {
      "chapter": 5,
      "value": 2610
    },
    {
      "chapter": 6,
      "value": 2831
    },
    {
      "chapter": 7,
      "value": 2954
    },
    {
      "chapter": 8,
      "value": 3316
    },
    {
      "chapter": 9,
      "value": 3273
    },
    {
      "chapter": 10,
      "value": 3674
    },
    {
      "chapter": 11,
      "value": 3520
    },
    {
      "chapter": 12,
      "value": 3549
    },
    {
      "chapter": 13,
      "value": 3566
    },
    {
      "chapter": 14,
      "value": 3453
    },
    {
      "chapter": 15,
      "value": 3409
    },
    {
      "chapter": 16,
      "value": 3138
    },
    {
      "chapter": 17,
      "value": 2715
    },
    {
      "chapter": 18,
      "value": 2418
    },
    {
      "chapter": 19,
      "value": 2463
    },
    {
      "chapter": 20,
      "value": 2219
    }
  ],
  "67bf33f455de5bcdb371c7f4": [
    {
      "chapter": 1,
      "value": 2020
    },
    {
      "chapter": 2,
      "value": 2051
    },
    {
      "chapter": 3,
      "value": 2272
    },
    {
      "chapter": 4,
      "value": 2543
    },
    {
      "chapter": 5,
      "value": 2686
    },
    {
      "chapter": 6,
      "value": 2904
    },
    {
      "chapter": 7,
      "value": 3296
    },
    {
      "chapter": 8,
      "value": 3618
    },
    {
      "chapter": 9,
      "value": 3860
    },
    {
      "chapter": 10,
      "value": 4295
    },
    {
      "chapter": 11,
      "value": 4547
    },
    {
      "chapter": 12,
      "value": 4274
    },
    {
      "chapter": 13,
      "value": 3842
    },
    {
      "chapter": 14,
      "value": 3639
    },
    {
      "chapter": 15,
      "value": 3352
    },
    {
      "chapter": 16,
      "value": 3030
    },
    {
      "chapter": 17,
      "value": 2684
    },
    {
      "chapter": 18,
      "value": 2574
    },
    {
      "chapter": 19,
      "value": 2355
    },
    {
      "chapter": 20,
      "value": 2157
    }
  ],
  "67bf340e55de5bcdb371c80c": [
    {
      "chapter": 1,
      "value": 2080
    },
    {
      "chapter": 2,
      "value": 2136
    },
    {
      "chapter": 3,
      "value": 2239
    },
    {
      "chapter": 4,
      "value": 2358
    },
    {
      "chapter": 5,
      "value": 2571
    },
    {
      "chapter": 6,
      "value": 2860
    },
    {
      "chapter": 7,
      "value": 3055
    },
    {
      "chapter": 8,
      "value": 3365
    },
    {
      "chapter": 9,
      "value": 3610
    },
    {
      "chapter": 10,
      "value": 3536
    },
    {
      "chapter": 11,
      "value": 3734
    },
    {
      "chapter": 12,
      "value": 3582
    },
    {
      "chapter": 13,
      "value": 3516
    },
    {
      "chapter": 14,
      "value": 3457
    },
    {
      "chapter": 15,
      "value": 3162
    },
    {
      "chapter": 16,
      "value": 3075
    },
    {
      "chapter": 17,
      "value": 2736
    },
    {
      "chapter": 18,
      "value": 2562
    },
    {
      "chapter": 19,
      "value": 2340
    },
    {
      "chapter": 20,
      "value": 2434
    }
  ],
  "67bf342255de5bcdb371c825": [
    {
      "chapter": 1,
      "value": 1974
    },
    {
      "chapter": 2,
      "value": 2019
    },
    {
      "chapter": 3,
      "value": 2260
    },
    {
      "chapter": 4,
      "value": 2442
    },
    {
      "chapter": 5,
      "value": 2564
    },
    {
      "chapter": 6,
      "value": 2810
    },
    {
      "chapter": 7,
      "value": 3108
    },
    {
      "chapter": 8,
      "value": 3553
    },
    {
      "chapter": 9,
      "value": 3701
    },
    {
      "chapter": 10,
      "value": 3662
    },
    {
      "chapter": 11,
      "value": 3727
    },
    {
      "chapter": 12,
      "value": 3565
    },
    {
      "chapter": 13,
      "value": 3600
    },
    {
      "chapter": 14,
      "value": 3421
    },
    {
      "chapter": 15,
      "value": 3288
    },
    {
      "chapter": 16,
      "value": 2918
    },
    {
      "chapter": 17,
      "value": 2899
    },
    {
      "chapter": 18,
      "value": 2604
    },
    {
      "chapter": 19,
      "value": 2499
    },
    {
      "chapter": 20,
      "value": 2559
    }
  ],
  "67bf359955de5bcdb371c8a8": [
    {
      "chapter": 1,
      "value": 2087
    },
    {
      "chapter": 2,
      "value": 2311
    },
    {
      "chapter": 3,
      "value": 2372
    },
    {
      "chapter": 4,
      "value": 2600
    },
    {
      "chapter": 5,
      "value": 2983
    },
    {
      "chapter": 6,
      "value": 3384
    },
    {
      "chapter": 7,
      "value": 3763
    },
    {
      "chapter": 8,
      "value": 4260
    },
    {
      "chapter": 9,
      "value": 4377
    },
    {
      "chapter": 10,
      "value": 4386
    },
    {
      "chapter": 11,
      "value": 4614
    },
    {
      "chapter": 12,
      "value": 4751
    },
    {
      "chapter": 13,
      "value": 4647
    },
    {
      "chapter": 14,
      "value": 4172
    },
    {
      "chapter": 15,
      "value": 4108
    },
    {
      "chapter": 16,
      "value": 4050
    },
    {
      "chapter": 17,
      "value": 3771
    },
    {
      "chapter": 18,
      "value": 3268
    },
    {
      "chapter": 19,
      "value": 3068
    },
    {
      "chapter": 20,
      "value": 3314
    }
  ],
  "67bf35a755de5bcdb371c8b6": [
    {
      "chapter": 1,
      "value": 1993
    },
    {
      "chapter": 2,
      "value": 2038
    },
    {
      "chapter": 3,
      "value": 2274
    },
    {
      "chapter": 4,
      "value": 2511
    },
    {
      "chapter": 5,
      "value": 2710
    },
    {
      "chapter": 6,
      "value": 2924
    },
    {
      "chapter": 7,
      "value": 3087
    },
    {
      "chapter": 8,
      "value": 3406
    },
    {
      "chapter": 9,
      "value": 3867
    },
    {
      "chapter": 10,
      "value": 4203
    },
    {
      "chapter": 11,
      "value": 4278
    },
    {
      "chapter": 12,
      "value": 4558
    },
    {
      "chapter": 13,
      "value": 4688
    },
    {
      "chapter": 14,
      "value": 4842
    },
    {
      "chapter": 15,
      "value": 4426
    },
    {
      "chapter": 16,
      "value": 4373
    },
    {
      "chapter": 17,
      "value": 3765
    },
    {
      "chapter": 18,
      "value": 3367
    },
    {
      "chapter": 19,
      "value": 3157
    },
    {
      "chapter": 20,
      "value": 2790
    }
  ],
  "67bf35bd55de5bcdb371c8c3": [
    {
      "chapter": 1,
      "value": 2070
    },
    {
      "chapter": 2,
      "value": 2094
    },
    {
      "chapter": 3,
      "value": 2148
    },
    {
      "chapter": 4,
      "value": 2362
    },
    {
      "chapter": 5,
      "value": 2596
    },
    {
      "chapter": 6,
      "value": 2861
    },
    {
      "chapter": 7,
      "value": 3188
    },
    {
      "chapter": 8,
      "value": 3549
    },
    {
      "chapter": 9,
      "value": 3803
    },
    {
      "chapter": 10,
      "value": 4176
    },
    {
      "chapter": 11,
      "value": 4126
    },
    {
      "chapter": 12,
      "value": 3922
    },
    {
      "chapter": 13,
      "value": 3938
    },
    {
      "chapter": 14,
      "value": 3996
    },
    {
      "chapter": 15,
      "value": 3887
    },
    {
      "chapter": 16,
      "value": 3888
    },
    {
      "chapter": 17,
      "value": 3557
    },
    {
      "chapter": 18,
      "value": 3324
    },
    {
      "chapter": 19,
      "value": 3090
    },
    {
      "chapter": 20,
      "value": 2803
    }
  ],
  "67bf375555de5bcdb371c92a": [
    {
      "chapter": 1,
      "value": 2011
    },
    {
      "chapter": 2,
      "value": 2156
    },
    {
      "chapter": 3,
      "value": 2277
    },
    {
      "chapter": 4,
      "value": 2365
    },
    {
      "chapter": 5,
      "value": 2604
    },
    {
      "chapter": 6,
      "value": 2853
    },
    {
      "chapter": 7,
      "value": 3119
    },
    {
      "chapter": 8,
      "value": 3321
    },
    {
      "chapter": 9,
      "value": 3454
    },
    {
      "chapter": 10,
      "value": 3688
    },
    {
      "chapter": 11,
      "value": 3906
    },
    {
      "chapter": 12,
      "value": 3946
    },
    {
      "chapter": 13,
      "value": 3513
    },
    {
      "chapter": 14,
      "value": 3392
    },
    {
      "chapter": 15,
      "value": 3139
    },
    {
      "chapter": 16,
      "value": 3069
    },
    {
      "chapter": 17,
      "value": 2806
    },
    {
      "chapter": 18,
      "value": 2527
    },
    {
      "chapter": 19,
      "value": 2239
    },
    {
      "chapter": 20,
      "value": 2068
    }
  ]
}