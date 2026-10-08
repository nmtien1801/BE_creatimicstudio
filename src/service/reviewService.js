import db from "../models/index.js";
import { col, fn } from "sequelize";

const getProductReviews = async (productId, page = 1, limit = 20) => {
  try {
    const id = Number(productId);
    if (!Number.isInteger(id) || id < 1) {
      return { EM: "Mã sản phẩm không hợp lệ!", EC: 1, DT: null };
    }

    const product = await db.Product.findByPk(id, { attributes: ["id"] });
    if (!product) {
      return { EM: "Không tìm thấy sản phẩm!", EC: 2, DT: null };
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));
    const where = { productId: id };
    const [reviews, total, aggregates] = await Promise.all([
      db.Review.findAll({
        where,
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "userName", "image"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      }),
      db.Review.count({ where }),
      db.Review.findAll({
        where,
        attributes: [
          [fn("AVG", col("rating")), "averageRating"],
          [fn("COUNT", col("id")), "totalReviews"],
        ],
        raw: true,
      }),
    ]);

    const summary = aggregates[0] || {};
    return {
      EM: "Lấy đánh giá sản phẩm thành công!",
      EC: 0,
      DT: {
        reviews,
        summary: {
          averageRating: Number(summary.averageRating) || 0,
          totalReviews: Number(summary.totalReviews) || total,
        },
        page: currentPage,
        limit: pageSize,
        total,
      },
    };
  } catch (error) {
    console.error("Lỗi lấy đánh giá sản phẩm:", error);
    return { EM: "Lỗi máy chủ khi lấy đánh giá sản phẩm!", EC: -1, DT: null };
  }
};

const getReviewEligibility = async (productId, userId) => {
  try {
    const id = Number(productId);
    if (!Number.isInteger(id) || id < 1 || !userId) {
      return { EM: "Thông tin khách hàng hoặc sản phẩm không hợp lệ!", EC: 1, DT: null };
    }

    const completedOrderItem = await db.OrderItem.findOne({
      where: { productId: id },
      attributes: ["id"],
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: ["orderId"],
          where: { userId, status: "completed" },
          required: true,
        },
      ],
    });
    const review = await db.Review.findOne({
      where: { productId: id, userId },
    });

    return {
      EM: "Kiểm tra điều kiện đánh giá thành công!",
      EC: 0,
      DT: {
        canReview: Boolean(completedOrderItem),
        review,
      },
    };
  } catch (error) {
    console.error("Lỗi kiểm tra điều kiện đánh giá:", error);
    return { EM: "Lỗi máy chủ khi kiểm tra đánh giá!", EC: -1, DT: null };
  }
};

const createOrUpdateReview = async (productId, userId, data = {}) => {
  const id = Number(productId);
  const rating = Number(data.rating);
  const comment = typeof data.comment === "string" ? data.comment.trim() : "";

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    !userId ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    !comment ||
    comment.length > 2000
  ) {
    return {
      EM: "Vui lòng chọn số sao từ 1 đến 5 và nhập nhận xét tối đa 2000 ký tự!",
      EC: 1,
      DT: null,
    };
  }

  try {
    return await db.sequelize.transaction(async (transaction) => {
      const completedOrderItem = await db.OrderItem.findOne({
        where: { productId: id },
        attributes: ["id"],
        include: [
          {
            model: db.Order,
            as: "order",
            attributes: ["orderId"],
            where: { userId, status: "completed" },
            required: true,
          },
        ],
        transaction,
      });

      if (!completedOrderItem) {
        return {
          EM: "Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã hoàn tất!",
          EC: 3,
          DT: null,
        };
      }

      const [review, created] = await db.Review.findOrCreate({
        where: { productId: id, userId },
        defaults: { productId: id, userId, rating, comment },
        transaction,
      });

      if (!created) {
        await review.update({ rating, comment }, { transaction });
      }

      const savedReview = await db.Review.findByPk(review.id, {
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "userName", "image"],
          },
        ],
        transaction,
      });

      return {
        EM: created ? "Gửi đánh giá thành công!" : "Cập nhật đánh giá thành công!",
        EC: 0,
        DT: savedReview,
      };
    });
  } catch (error) {
    console.error("Lỗi lưu đánh giá sản phẩm:", error);
    return { EM: "Lỗi máy chủ khi lưu đánh giá!", EC: -1, DT: null };
  }
};

export default {
  getProductReviews,
  getReviewEligibility,
  createOrUpdateReview,
};
