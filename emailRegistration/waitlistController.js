import WaitlistEmail from "./waitlistModel.js";
import ApiError from "./ApiError.js";
import ApiResponse from "./ApiResponse.js";

// Simple async handler since you don't have express-async-handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const subscribeWaitlistEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  try {
    const newEmail = await WaitlistEmail.create({ email });

    res
      .status(201)
      .json(new ApiResponse(201, newEmail, "Email subscribed successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Email already exists");
    }
    throw new ApiError(500, "Failed to subscribe email");
  }
});

const getAllWaitlistEmails = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, active = true } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { subscribedAt: -1 },
  };

  const filter = active !== "false" ? { isActive: true } : {};

  const emails = await WaitlistEmail.find(filter)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit);

  const total = await WaitlistEmail.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        emails,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
      "Emails retrieved successfully"
    )
  );
});

const unsubscribeWaitlistEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const updatedEmail = await WaitlistEmail.findOneAndUpdate(
    { email },
    { isActive: false },
    { new: true }
  );

  if (!updatedEmail) {
    throw new ApiError(404, "Email not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedEmail, "Email unsubscribed successfully")
    );
});

export {
  subscribeWaitlistEmail,
  getAllWaitlistEmails,
  unsubscribeWaitlistEmail,
};
