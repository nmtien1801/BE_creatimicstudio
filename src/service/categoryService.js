import db from "../models/index.js";
import { Op, sequelize } from "sequelize";

const getListCategory = async (query = {}) => {
  try {
    // ================== PAGINATION ==================
    const hasPaging = query.page && query.limit;
    const page = hasPaging ? parseInt(query.page) : null;
    const limit = hasPaging ? parseInt(query.limit) : null;
    const offset = hasPaging ? (page - 1) * limit : null;

    // ================== WHERE ==================
    const where = { parentId: null };

    // ================== FIND OPTIONS ==================
    const findOptions = {
      where,
      order: [["createdAt", "DESC"]],
      attributes: {
        include: [
          // Subquery đếm sản phẩm cho danh mục CHA
          [
            db.sequelize.literal(`(
              SELECT COUNT(*)
              FROM "ProductCategory" AS "cp"
              WHERE "cp"."categoryId" = "Category"."id"
            )`),
            "productCount",
          ],
        ],
      },
      include: [
        // ===== 1. PRODUCTS CỦA CATEGORY CHA =====
        {
          model: db.Product,
          as: "product", // Đảm bảo alias này khớp với khai báo trong model
          attributes: ["id", "name", "price", "image", "status"],
          through: { attributes: [] },
        },
        // ===== 2. CATEGORY CON =====
        {
          model: db.Category,
          as: "children",
          attributes: [
            "id",
            "name",
            "icon",
            "status",
            "parentId",
            // Subquery đếm sản phẩm cho danh mục CON
            [
              db.sequelize.literal(`(
                SELECT COUNT(*)
                FROM "ProductCategory" AS "cp"
                WHERE "cp"."categoryId" = "children"."id"
              )`),
              "productCount",
            ],
          ],
          include: [
            // ===== PRODUCTS CỦA CATEGORY CON =====
            {
              model: db.Product,
              as: "product",
              attributes: ["id", "name", "price", "image", "status"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    };

    // ================== APPLY PAGINATION ==================
    if (hasPaging) {
      findOptions.limit = limit;
      findOptions.offset = offset;
    }

    // ================== QUERY ==================
    const rows = await db.Category.findAll(findOptions);

    // ================== TOTAL ==================
    const total = hasPaging ? await db.Category.count({ where }) : rows.length;

    // ================== RESPONSE ==================
    return {
      EM: "Get category list success",
      EC: 0,
      DT: { categories: rows, total, page, limit },
    };
  } catch (error) {
    console.error(">>> Error getListCategory:", error);
    return { EM: "Error from service", EC: -1, DT: "" };
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await db.Category.findByPk(id, {
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name"],
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "icon", "status"],
        },
      ],
    });
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };
    return { EM: "Get category success", EC: 0, DT: category };
  } catch (error) {
    console.error(">>> Error getCategoryById:", error);
    return { EM: "Error from service (getCategoryById)", EC: -1, DT: "" };
  }
};

const createCategory = async (rawData) => {
  try {
    const newCategory = await db.Category.create({
      name: rawData.name || "",
      icon: rawData.icon || "",
      status: rawData.status ?? true,
      parentId: rawData.parentId || null,
    });

    return { EM: "Create category success", EC: 0, DT: newCategory };
  } catch (error) {
    console.error(">>> Error createCategory:", error);
    return { EM: "Error from service (createCategory)", EC: -1, DT: "" };
  }
};

const updateCategory = async (id, rawData) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };

    const updates = {
      name: rawData.name ?? category.name,
      icon: rawData.icon ?? category.icon,
      status: rawData.status ?? category.status,
      parentId: rawData.parentId ?? category.parentId,
    };

    await category.update(updates);
    return { EM: "Update category success", EC: 0, DT: category };
  } catch (error) {
    console.error(">>> Error updateCategory:", error);
    return { EM: "Error from service (updateCategory)", EC: -1, DT: "" };
  }
};

const deleteCategory = async (id) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };
    await category.destroy();
    return { EM: "Delete category success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error deleteCategory:", error);
    return { EM: "Error from service (deleteCategory)", EC: -1, DT: "" };
  }
};

const getFilteredCategories = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.categoryId && query.categoryId !== "all") {
      where.id = Number(query.categoryId);
    }

    let includeProduct;

    if (
      query.priceProduct &&
      query.priceProduct !== "all" &&
      !isNaN(Number(query.priceProduct))
    ) {
      includeProduct = {
        model: db.Product,
        as: "product",
        attributes: [
          "id",
          "name",
          "price",
          "image",
          "description",
          "detail",
          "status",
        ],
        through: { attributes: [] },
        where: {
          price: { [Op.gte]: Number(query.priceProduct) },
        },
        required: true,
      };
    }

    const total = await db.Category.count({
      where,
      include: includeProduct ? [includeProduct] : [],
      distinct: true,
    });

    const rows = await db.Category.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: includeProduct ? [includeProduct] : [],
    });

    return {
      EM: "Get filtered categories success",
      EC: 0,
      DT: {
        categories: rows,
        total,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error(">>> Error getFilteredCategories:", error);
    return { EM: "Error from service (getFilteredCategories)", EC: -1, DT: "" };
  }
};

export default {
  getListCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getFilteredCategories,
};
