import Admin from "../models/admin.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import CharacterStock from "../models/characterStock.models.js";
import { defaultAvatarUrl } from "../constants.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";
import ErrorLog from "../models/errorLog.models.js";
import Transaction from "../models/transaction.models.js";
import User from "../models/user.models.js";
import ChapterRelease from "../models/chapterRelease.models.js";
//the super admin has already been registered we only need to have login

const adminLogin = asyncHandler(async (req, res, _) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password is required");
  }

  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new ApiError(404, "invalid admin username");
  }

  if (!(await admin.validatePassword(password))) {
    throw new ApiError(401, "invalid password");
  }

  const accessToken = await admin.generateAccessToken();

  const loggedInAdmin = await Admin.findById(admin._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 900000,
    sameSite: "None"
  };

  res
    .status(200)
    .cookie("adminToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInAdmin, accessToken },
        "admin logged in successfully"
      )
    );
});

const adminLogout = asyncHandler(async (req, res, _) => {
  //i just need to delete token in cookies
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
  };

  res
    .status(200)
    .clearCookie("adminToken", options)
    .json(new ApiResponse(200, null, "Admin logged out successfully"));
});

const createAdmin = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  //we also need to check if it is an super admin
  if (!req.admin.isSuperAdmin) {
    throw new ApiError(403, "only super admin access");
  }

  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, "username and password is required");
  }

  const existingAdmin = await Admin.findOne({
    username: username.toLowerCase(),
  });

  if (existingAdmin) {
    throw new ApiError(400, "admin already exists");
  }

  const createdAdmin = await Admin.create({
    username: username?.trim().toLowerCase(),
    password,
  });

  if (!createdAdmin) {
    throw new ApiError(500, "there was some error while adding admin");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdAdmin, "admin added successfully"));
});

const deleteAdmin = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  if (!req.admin.isSuperAdmin) {
    throw new ApiError(403, "only super admin access");
  }

  const { username } = req.body;

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new ApiError(404, `admin with username ${username} not found`);
  }

  const removedAdmin = await Admin.findByIdAndDelete(admin._id);

  res
    .status(200)
    .json(new ApiResponse(200, removedAdmin, "admin deleted successfully"));
});

const createCharacterStock = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { name, initialValue, tickerSymbol } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "name required");
  }

  let characterStock;
  //check if the stock already exists and is removed
  const existingCharacterStock = await CharacterStock.findOne({
    $or: [{ name }, { tickerSymbol }],
  });

  if (existingCharacterStock && !existingCharacterStock.isRemoved) {
    throw new ApiError(400, "character stock or ticker symbol already added ");
  } else if (existingCharacterStock?.isRemoved) {
    existingCharacterStock.isRemoved = false;
    await existingCharacterStock.save({ validateModifiedOnly: true });
    characterStock = existingCharacterStock;
  } else {
    if (!initialValue?.trim()) {
      throw new ApiError(400, "initial value required");
    }

    if (!parseInt(initialValue)) {
      throw new ApiError(400, "enter a valid initial value");
    }

    if (!tickerSymbol?.trim()) {
      throw new ApiError(400, "ticker symbol required");
    }

    const imageLocalFilePath = req.file?.path;
    const imageUrl = imageLocalFilePath
      ? await uploadOnCloudinary(imageLocalFilePath, true)
      : defaultAvatarUrl;

    if (!imageUrl) {
      throw new ApiError(500, "not able to upload image");
    }

    characterStock = await CharacterStock.create({
      name: name.trim(),
      initialValue: parseInt(initialValue),
      currentValue: initialValue,
      imageURL: imageUrl,
      tickerSymbol,
    });

    if (!characterStock) {
      throw new ApiError(
        500,
        "there was some error while creating character Stock"
      );
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, characterStock, "character stock added successfully")
    );
});

//need to request the super admin for permanent deletion
//we can handle deleting referencings later
const deleteCharacterStockTemp = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "name is required");
  }

  const characterStock = await CharacterStock.findOne({ name });

  if (!characterStock || characterStock.isRemoved) {
    throw new ApiError(404, "character stock not found");
  }

  const removedCharacterStock = await CharacterStock.findByIdAndUpdate(
    characterStock._id,
    { isRemoved: true },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, removedCharacterStock, "stock deleted successfully")
    );
});

const updateStockImage = asyncHandler(async (req, res, _) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { stockId } = req.body;
  const imageLocalPath = req.file?.path;

  if (!stockId?.trim()) {
    throw new ApiError(400, "stockId is required");
  }

  if (!imageLocalPath) {
    throw new ApiError(400, "no file uploaded");
  }

  const stock = await CharacterStock.findById(stockId);

  if (!stock) {
    throw new ApiError(404, "stock not found");
  }

  const oldImageUrl = stock.imageURL;
  if (oldImageUrl != defaultAvatarUrl) {
    const result = await deleteFromCloudinary(oldImageUrl);
    if (!result || result === "error") {
      throw new ApiError(500, "error in deleting the old image", result);
    }
  }

  const newImageUrl = await uploadOnCloudinary(imageLocalPath, true);
  if (!newImageUrl) {
    throw new ApiError(500, "not able to upload new image");
  }

  const updatedStock = await CharacterStock.findByIdAndUpdate(
    stockId,
    {
      $set: {
        imageURL: newImageUrl,
      },
    },
    { new: true }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stock: updatedStock,
        newImageUrl,
      },
      "stock image updated successfully"
    )
  );
});

const getErrorLogs = asyncHandler(async (req, res) => {
  if (!req?.admin) {
    throw new ApiError(403, "Unauthorized access to error logs");
  }

  const { type = "all" } = req.query;

  const query = {};

  // Filter by error type
  if (type === "internal") {
    query.isInternalServerError = true;
  } else if (type === "highPriority") {
    query.isHighPriority = true;
  }

  const errors = await ErrorLog.find(query)
    .sort({ createdAt: -1 })
    .select("-rawError"); // Exclude raw error for security

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { errors },
        `${type} error logs fetched successfully`
      )
    );
});

const getUserByUsername = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { username } = req.query;

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const user = await User.findOne({ username: username.toLowerCase() })
    .populate({
      path: "ownedStocks.stock",
      select: "name currentValue initialValue",
    })
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  // Calculate current stock value and net worth
  const currentStockValue = user.ownedStocks.reduce(
    (total, stock) => total + stock.stock.currentValue * stock.quantity,
    0
  );
  const currentNetWorth = user.accountValue + currentStockValue;

  // Calculate profit percentage
  const profitPercentage =
    user.prevNetWorth > 0
      ? ((currentNetWorth - user.prevNetWorth) / user.prevNetWorth) * 100
      : 0;

  const userResponse = user.toObject();
  userResponse.profit = profitPercentage;
  userResponse.stockValue = currentStockValue;
  userResponse.netWorth = currentNetWorth;

  res
    .status(200)
    .json(
      new ApiResponse(200, userResponse, "user details fetched successfully")
    );
});

const getTopTradersByChapter = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { chapterNumber, sortBy = "totalTransactions", limit = 100 } = req.query;

  // Validate sort field
  const validSortFields = [
    "totalTransactions",
    "buyCount",
    "sellCount",
    "buyVolume",
    "sellVolume",
    "totalVolume",
  ];

  if (!validSortFields.includes(sortBy)) {
    throw new ApiError(
      400,
      `Invalid sort field. Must be one of: ${validSortFields.join(", ")}`
    );
  }

  let targetChapter;

  if (chapterNumber) {
    // If chapter number provided, verify it exists
    targetChapter = await ChapterRelease.findOne({ chapter: chapterNumber });
    if (!targetChapter) {
      throw new ApiError(404, `Chapter ${chapterNumber} not found`);
    }
  } else {
    // If no chapter number, get the latest chapter
    targetChapter = await ChapterRelease.findOne({})
      .sort({ chapter: -1 })
      .limit(1);

    if (!targetChapter) {
      throw new ApiError(404, "No chapters found");
    }
  }

  // Aggregate pipeline to calculate both transaction counts and volumes
  const traders = await Transaction.aggregate([
    // Match transactions for the specified chapter
    {
      $match: {
        chapterPurchasedAt: targetChapter.chapter,
      },
    },
    // Group by user and calculate metrics
    {
      $group: {
        _id: "$purchasedBy",
        totalTransactions: { $sum: 1 },
        buyCount: {
          $sum: {
            $cond: [{ $eq: ["$type", "buy"] }, 1, 0],
          },
        },
        sellCount: {
          $sum: {
            $cond: [{ $eq: ["$type", "sell"] }, 1, 0],
          },
        },
        buyVolume: {
          $sum: {
            $cond: [
              { $eq: ["$type", "buy"] },
              { $multiply: ["$quantity", "$value"] },
              0,
            ],
          },
        },
        sellVolume: {
          $sum: {
            $cond: [
              { $eq: ["$type", "sell"] },
              { $multiply: ["$quantity", "$value"] },
              0,
            ],
          },
        },
        totalVolume: {
          $sum: { $multiply: ["$quantity", "$value"] },
        },
      },
    },
    // Lookup user details
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    // Unwind the userDetails array
    {
      $unwind: "$userDetails",
    },
    // Project only needed fields
    {
      $project: {
        _id: 1,
        username: "$userDetails.username",
        totalTransactions: 1,
        buyCount: 1,
        sellCount: 1,
        buyVolume: 1,
        sellVolume: 1,
        totalVolume: 1,
      },
    },
    // Sort by the specified field
    {
      $sort: {
        [sortBy]: -1,
      },
    },
    // Limit results
    {
      $limit: limit,
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        traders,
        chapter: targetChapter.chapter,
        sortedBy: sortBy,
      },
      `Top traders for chapter ${targetChapter.chapter} fetched successfully`
    )
  );
});

const getChapterAnalytics= asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(401, "unauthenticated request");
  }

  const { chapterNumber } = req.query;

  let targetChapter;
  if (chapterNumber) {
    targetChapter = await ChapterRelease.findOne({ chapter: chapterNumber });
    if (!targetChapter) {
      throw new ApiError(404, `Chapter ${chapterNumber} not found`);
    }
  } else {
    targetChapter = await ChapterRelease.findOne({}).sort({ chapter: -1 });
    if (!targetChapter) {
      throw new ApiError(404, "No chapters found");
    }
  }

  // Get total users
  const totalUsers = await User.countDocuments();

  const newUsersQuery = {
    createdAt: { $gte: targetChapter.releaseDate },
  };

  const newUsers = await User.countDocuments(newUsersQuery);

  // Calculate total market value (sum of all stocks * their current values)
  const marketStats = await CharacterStock.aggregate([
    {
      $match: { isRemoved: false },
    },
    {
      $lookup: {
        from: "users",
        let: { stockId: "$_id" },
        pipeline: [
          {
            $unwind: "$ownedStocks",
          },
          {
            $match: {
              $expr: {
                $eq: ["$ownedStocks.stock", "$$stockId"],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$ownedStocks.quantity" },
            },
          },
        ],
        as: "ownership",
      },
    },
    {
      $unwind: {
        path: "$ownership",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: null,
        totalMarketValue: {
          $sum: {
            $multiply: [
              "$currentValue",
              { $ifNull: ["$ownership.totalQuantity", 0] },
            ],
          },
        },
        totalStocks: { $sum: 1 },
        activeStocks: {
          $sum: {
            $cond: [
              { $gt: [{ $ifNull: ["$ownership.totalQuantity", 0] }, 0] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Get transaction statistics for this chapter
  const chapterTransactionStats = await Transaction.aggregate([
    {
      $match: {
        chapterPurchasedAt: targetChapter.chapter,
      },
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        buyCount: {
          $sum: { $cond: [{ $eq: ["$type", "buy"] }, 1, 0] },
        },
        sellCount: {
          $sum: { $cond: [{ $eq: ["$type", "sell"] }, 1, 0] },
        },
        totalVolume: {
          $sum: { $multiply: ["$quantity", "$value"] },
        },
        buyVolume: {
          $sum: {
            $cond: [
              { $eq: ["$type", "buy"] },
              { $multiply: ["$quantity", "$value"] },
              0,
            ],
          },
        },
        sellVolume: {
          $sum: {
            $cond: [
              { $eq: ["$type", "sell"] },
              { $multiply: ["$quantity", "$value"] },
              0,
            ],
          },
        },
        uniqueTraders: { $addToSet: "$purchasedBy" },
      },
    },
    {
      $project: {
        _id: 0,
        totalTransactions: 1,
        buyCount: 1,
        sellCount: 1,
        totalVolume: 1,
        buyVolume: 1,
        sellVolume: 1,
        uniqueTraders: { $size: "$uniqueTraders" },
      },
    },
  ]);

  // Get overall transaction statistics
  const overallTransactionStats = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        buyCount: {
          $sum: { $cond: [{ $eq: ["$type", "buy"] }, 1, 0] },
        },
        sellCount: {
          $sum: { $cond: [{ $eq: ["$type", "sell"] }, 1, 0] },
        },
        totalVolume: {
          $sum: { $multiply: ["$quantity", "$value"] },
        },
        buyVolume: {
          $sum: {
            $cond: [
              { $eq: ["$type", "buy"] },
              { $multiply: ["$quantity", "$value"] },
              0,
            ],
          },
        },
        sellVolume: {
          $sum: {
            $cond: [
              { $eq: ["$type", "sell"] },
              { $multiply: ["$quantity", "$value"] },
              0,
            ],
          },
        },
        uniqueTraders: { $addToSet: "$purchasedBy" },
      },
    },
    {
      $project: {
        _id: 0,
        totalTransactions: 1,
        buyCount: 1,
        sellCount: 1,
        totalVolume: 1,
        buyVolume: 1,
        sellVolume: 1,
        uniqueTraders: { $size: "$uniqueTraders" },
      },
    },
  ]);

  const stats = {
    chapter: targetChapter.chapter,
    totalUsers,
    newUsers,
    marketStats: marketStats[0] || {
      totalMarketValue: 0,
      totalStocks: 0,
      activeStocks: 0,
    },
    chapterTransactions: chapterTransactionStats[0] || {
      totalTransactions: 0,
      buyCount: 0,
      sellCount: 0,
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0,
      uniqueTraders: 0,
    },
    overallTransactions: overallTransactionStats[0] || {
      totalTransactions: 0,
      buyCount: 0,
      sellCount: 0,
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0,
      uniqueTraders: 0,
    },
    timestamp: new Date(),
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        stats,
        `Statistics for chapter ${targetChapter.chapter} fetched successfully`
      )
    );
});

const validateTransactionQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new ApiError(400, "Invalid quantity. Must be a positive integer");
  }
  return parsedQuantity;
};

const createTransaction = asyncHandler( async (req, res, _next) => {
  if (!req.admin) {
    throw new ApiError(400,'unauthorized error');
  }

  const { username, stockname, quantity, type } = req.body;

  if (!username?.trim() || !stockname?.trim() || !quantity || !type?.trim()) {
    throw new ApiError(400, 'All fields are required');
  }

  const allowedTypes = ["buy", "sell"];

  if (!allowedTypes.includes(type)) {
    throw new ApiError(400,'only buy and sell allowed');
  }

  const stockPromise = CharacterStock.findOne({name: stockname}).lean();
  const userPromise = User.findOne({username: username.trim()}).lean();
  const latestChapterPromise = ChapterRelease.findOne().sort({releaseDate: -1}).lean();

  const [stock, user, latestChapterDoc] = await Promise.all([
    stockPromise,
    userPromise,
    latestChapterPromise
  ])

  if (!user) {
    throw new ApiError(400,'user not found');
  }

  if (!stock) {
    throw new ApiError(400,'stock not found');
  }

  if (!latestChapterDoc) {
    throw new ApiError(400,'no chapter released');
  }

  const validatedQuantity = validateTransactionQuantity(quantity);

  const transaction = await Transaction.create({
    purchasedBy: user._id,
    stockID: stock._id,
    quantity: validatedQuantity,
    value: stock.currentValue,
    type,
    chapterPurchasedAt: latestChapterDoc.chapter
  })

  res
    .status(200)
    .json(new ApiResponse(200,'transaction created successfully'));

})

export {
  adminLogin,
  getChapterAnalytics,
  updateStockImage,
  createAdmin,
  createCharacterStock,
  deleteCharacterStockTemp,
  deleteAdmin,
  adminLogout,
  getErrorLogs,
  getUserByUsername,
  getTopTradersByChapter,
  createTransaction
};
