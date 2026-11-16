import reviewService from "../service/reviewService.js";

const getProductReviews = async (req, res) => {
  const response = await reviewService.getProductReviews(
    req.params.productId,
    req.query.page,
    req.query.limit,
  );
  const statusCode =
    response.EC === 0 ? 200 : response.EC === 2 ? 404 : response.EC === 1 ? 400 : 500;
  return res.status(statusCode).json(response);
};

const getReviewsForAdmin = async (req, res) => {
  const response = await reviewService.getReviewsForAdmin(
    req.query.page,
    req.query.limit,
    req.query.productId,
  );
  const statusCode = response.EC === 0 ? 200 : response.EC === 1 ? 400 : 500;
  return res.status(statusCode).json(response);
};

const deleteReview = async (req, res) => {
  const response = await reviewService.deleteReview(req.params.id);
  const statusCode =
    response.EC === 0 ? 200 : response.EC === 2 ? 404 : response.EC === 1 ? 400 : 500;
  return res.status(statusCode).json(response);
};

const getReviewEligibility = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({
      EM: "Vui lòng đăng nhập để đánh giá sản phẩm!",
      EC: -1,
      DT: null,
    });
  }

  const response = await reviewService.getReviewEligibility(
    req.params.productId,
    req.user.id,
  );
  return res.status(response.EC === 0 ? 200 : 400).json(response);
};

const createOrUpdateReview = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({
      EM: "Vui lòng đăng nhập để đánh giá sản phẩm!",
      EC: -1,
      DT: null,
    });
  }

  const response = await reviewService.createOrUpdateReview(
    req.params.productId,
    req.user.id,
    req.body,
  );
  const statusCode = response.EC === 0 ? 200 : response.EC === 1 ? 400 : 500;
  return res.status(statusCode).json(response);
};

export default {
  getProductReviews,
  getReviewsForAdmin,
  deleteReview,
  getReviewEligibility,
  createOrUpdateReview,
};
