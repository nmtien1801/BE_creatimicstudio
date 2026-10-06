import db from "../models";

const { CartItem, Product } = db;

const serializeItem = (item) => ({
  id: item.product.id,
  cartItemId: item.id,
  name: item.product.name,
  price: Number(item.product.price) || 0,
  image: item.product.image || "",
  quantity: item.quantity,
});

const getCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    return res.json({ EC: 0, DT: items.map(serializeItem) });
  } catch (error) {
    console.error(">>> Error getCart:", error);
    return res
      .status(500)
      .json({ EC: -1, EM: "Không thể tải giỏ hàng", DT: [] });
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Math.max(1, Number(req.body.quantity) || 1);
    const product = await Product.findByPk(productId);
    if (!product)
      return res.status(404).json({ EC: -1, EM: "Sản phẩm không tồn tại" });

    const [item, created] = await CartItem.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { quantity },
    });
    if (!created) await item.update({ quantity: item.quantity + quantity });

    const saved = await CartItem.findByPk(item.id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "image"],
        },
      ],
    });
    return res.json({ EC: 0, DT: serializeItem(saved) });
  } catch (error) {
    console.error(">>> Error addToCart:", error);
    return res.status(500).json({ EC: -1, EM: "Không thể thêm vào giỏ hàng" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    const item = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item)
      return res
        .status(404)
        .json({ EC: -1, EM: "Không tìm thấy sản phẩm trong giỏ" });
    if (!Number.isInteger(quantity) || quantity < 1) await item.destroy();
    else await item.update({ quantity });
    return res.json({ EC: 0, DT: null });
  } catch (error) {
    console.error(">>> Error updateCartItem:", error);
    return res.status(500).json({ EC: -1, EM: "Không thể cập nhật giỏ hàng" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await CartItem.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    return res.json({ EC: 0, DT: null });
  } catch (error) {
    console.error(">>> Error removeFromCart:", error);
    return res.status(500).json({ EC: -1, EM: "Không thể xóa sản phẩm" });
  }
};

export default { getCart, addToCart, updateCartItem, removeFromCart };
