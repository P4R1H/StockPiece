import getWaitlistEmailModel from "../models/waitlistEmail.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const subscribeWaitlistEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  try {
    const WaitlistEmail = await getWaitlistEmailModel();
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

  const WaitlistEmail = await getWaitlistEmailModel();

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

  const WaitlistEmail = await getWaitlistEmailModel();
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
