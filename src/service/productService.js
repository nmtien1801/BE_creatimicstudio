import db from "../models/index.js";
import { Op, fn, col, where } from "sequelize";

const getListProduct = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const keyword = query.keyword || "";

    const condition = {};

    if (keyword) {
      condition.name = where(fn("LOWER", col("name")), {
        [Op.like]: `%${keyword.toLowerCase()}%`,
      });
    }

    // filter on top‑seller flag when requested
    if (query.isTopSeller !== undefined) {
      condition.isTopSeller =
        query.isTopSeller === "true" || query.isTopSeller === true;
    }

    // filter by maSP if provided
    if (query.maSP) {
      condition.maSP = query.maSP;
    }

    const products = await db.Product.findAll({
      where: condition,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const total = await db.Product.count({
      where: condition,
    });

    return {
      EM: "Get product list success",
      EC: 0,
      DT: { products, total, page, limit },
    };
  } catch (error) {
    console.error(">>> Error getListProduct:", error);
    return { EM: "Error from service (getListProduct)", EC: -1, DT: "" };
  }
};

const getProductById = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };
    return { EM: "Get product success", EC: 0, DT: product };
  } catch (error) {
    console.error(">>> Error getProductById:", error);
    return { EM: "Error from service (getProductById)", EC: -1, DT: "" };
  }
};

const createProduct = async (rawData) => {
  try {
    const newProduct = await db.Product.create({
      name: rawData.name || "",
      image: rawData.image || "",
      description: rawData.description || "",
      detail: rawData.detail || "",
      price: rawData.price ?? 0,
      status: rawData.status ?? true,
      isTopSeller: rawData.isTopSeller ?? false,
      maSP: rawData.maSP || "",
    });

    return { EM: "Create product success", EC: 0, DT: newProduct };
  } catch (error) {
    console.error(">>> Error createProduct:", error);
    return { EM: "Error from service (createProduct)", EC: -1, DT: "" };
  }
};

const updateProduct = async (id, rawData) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };

    const updates = {
      name: rawData.name ?? product.name,
      image: rawData.image ?? product.image,
      description: rawData.description ?? product.description,
      detail: rawData.detail ?? product.detail,
      price: rawData.price ?? product.price,
      status: rawData.status ?? product.status,
      isTopSeller: rawData.isTopSeller ?? product.isTopSeller,
      maSP: rawData.maSP ?? product.maSP,
    };

    await product.update(updates);
    return { EM: "Update product success", EC: 0, DT: product };
  } catch (error) {
    console.error(">>> Error updateProduct:", error);
    return { EM: "Error from service (updateProduct)", EC: -1, DT: "" };
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };
    await product.destroy();
    return { EM: "Delete product success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error deleteProduct:", error);
    return { EM: "Error from service (deleteProduct)", EC: -1, DT: "" };
  }
};

const getListProductDropdown = async () => {
  try {
    const products = await db.Product.findAll();
    return { EM: "Get product list success", EC: 0, DT: products };
  } catch (error) {
    console.error(">>> Lỗi getListProductDropdown:", error);
    return {
      EM: "Error from service (getListProductDropdown)",
      EC: -1,
      DT: "",
    };
  }
};

const getCategoryIdsRecursive = async (parentId) => {
  let ids = [parentId];

  // Tìm các danh mục con trực tiếp của parentId
  const children = await db.Category.findAll({
    where: { parentId: parentId },
    attributes: ["id"],
    raw: true,
  });

  // Duyệt qua từng con để lấy tiếp các cháu (đệ quy)
  for (const child of children) {
    const childIds = await getCategoryIdsRecursive(child.id);
    ids = ids.concat(childIds);
  }

  return ids;
};

const getFilteredProducts = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 8; // Số lượng sản phẩm mỗi trang
    const offset = (page - 1) * limit;

    const whereCondition = {};

    // 1. Lọc theo giá (Price Range)
    if (query.priceProduct && query.priceProduct !== "all") {
      switch (query.priceProduct) {
        case "under2m":
          whereCondition.price = { [Op.lt]: 2000000 };
          break;
        case "2mto4m":
          whereCondition.price = { [Op.between]: [2000000, 4000000] };
          break;
        case "4mto8m":
          whereCondition.price = { [Op.between]: [4000000, 8000000] };
          break;
        case "over8m":
          whereCondition.price = { [Op.gt]: 8000000 };
          break;
      }
    }

    // 2. Xử lý logic Category (Lấy cả sản phẩm của con nếu chọn cha)
    let includeCategory = {
      model: db.Category,
      as: "category",
      through: { attributes: [] },
    };

    if (query.categoryId && query.categoryId !== "all") {
      const targetId = Number(query.categoryId);

      // Lấy danh sách ID gồm: ID hiện tại + ID của tất cả các con/cháu
      const allCategoryIds = await getCategoryIdsRecursive(targetId);

      // Cập nhật điều kiện WHERE cho bảng Category được JOIN vào
      includeCategory.where = {
        id: { [Op.in]: allCategoryIds }, // Sử dụng toán tử IN (id1, id2, id3...)
      };
      includeCategory.required = true; // Bắt buộc phải có category thuộc list này
    }

    // 3. Truy vấn dữ liệu
    // Sử dụng findAndCountAll để lấy cả danh sách và tổng số lượng cùng lúc
    const { count, rows } = await db.Product.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
      include: [includeCategory],
      distinct: true, // Tránh đếm lặp sản phẩm khi JOIN
    });

    return {
      EM: "Lấy danh sách sản phẩm thành công",
      EC: 0,
      DT: {
        products: rows,
        total: count,
        page: page,
        limit: limit,
      },
    };
  } catch (error) {
    console.error(">>> Error getFilteredProducts:", error);
    return {
      EM: "Có lỗi xảy ra ở phía Server",
      EC: -1,
      DT: "",
    };
  }
};

export default {
  getListProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getListProductDropdown,
  getFilteredProducts,
};
