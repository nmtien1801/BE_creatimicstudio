const db = require("../models");
const { Order, OrderItem, Product, sequelize } = db;

// 1. Tạo đơn hàng mới
const createOrderService = async (data, userId) => {
  const t = await sequelize.transaction();

  try {
    const { fullName, phone, address, notes, paymentMethod, items } = data;

    if (
      !fullName ||
      !phone ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.some((item) => !item || typeof item !== "object")
    ) {
      await t.rollback();
      return {
        EM: "Vui lòng cung cấp đầy đủ thông tin nhận hàng và sản phẩm!",
        EC: 1,
        DT: null,
      };
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId || item.id),
      quantity: item.quantity == null ? 1 : Number(item.quantity),
    }));
    if (
      normalizedItems.some(
        (item) =>
          !Number.isInteger(item.productId) ||
          item.productId < 1 ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1,
      )
    ) {
      await t.rollback();
      return {
        EM: "Mã sản phẩm hoặc số lượng không hợp lệ!",
        EC: 1,
        DT: null,
      };
    }

    // Lấy danh sách ID các sản phẩm khách đặt
    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];

    // Truy vấn giá sản phẩm trực tiếp từ DB để đảm bảo tính an toàn
    const dbProducts = await Product.findAll({
      where: { id: productIds },
      transaction: t,
    });

    if (!dbProducts || dbProducts.length !== productIds.length) {
      await t.rollback();
      return {
        EM: "Không tìm thấy thông tin sản phẩm trong hệ thống!",
        EC: 2,
        DT: null,
      };
    }

    // Tạo mã đơn hàng duy nhất: ORD-<timestamp>
    const orderId = `ORD-${Date.now()}`;
    let totalAmount = 0;
    const orderItemsData = [];

    // Tính toán tổng tiền và chuẩn bị danh sách món cho OrderItem
    for (const item of normalizedItems) {
      const matchedProduct = dbProducts.find((p) => p.id === item.productId);

      if (matchedProduct) {
        const itemQuantity = item.quantity;
        const itemPrice = Number(matchedProduct.price) || 0;

        totalAmount += itemPrice * itemQuantity;

        orderItemsData.push({
          orderId,
          productId: matchedProduct.id,
          quantity: itemQuantity,
          price: itemPrice, // Lưu giá thực tế tại thời điểm mua
        });
      }
    }

    // 1. Ghi vào bảng Order (Đơn hàng tổng)
    const newOrder = await Order.create(
      {
        orderId,
        userId: userId || null, // null nếu là khách vãng lai chưa đăng nhập
        fullName,
        phone,
        address,
        notes: notes || "",
        totalAmount,
        paymentMethod: paymentMethod || "cod",
        status: "pending",
      },
      { transaction: t },
    );

    // 2. Ghi danh sách vào bảng OrderItem
    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    // Hoàn tất transaction
    await t.commit();

    return {
      EM: "Tạo đơn hàng thành công!",
      EC: 0,
      DT: {
        order: {
          orderId: newOrder.orderId,
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
          status: newOrder.status,
        },
      },
    };
  } catch (error) {
    await t.rollback();
    console.error("Lỗi tạo đơn hàng:", error);
    return {
      EM: "Lỗi hệ thống khi tạo đơn hàng!",
      EC: -1,
      DT: null,
    };
  }
};

// 2. Lấy chi tiết đơn hàng theo orderId (Dùng cho trang StatusThanhToan)
const getOrderDetailService = async (orderId) => {
  try {
    const order = await Order.findOne({
      where: { orderId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return {
        EM: "Không tìm thấy đơn hàng!",
        EC: 2,
        DT: null,
      };
    }

    // Chuẩn hóa dữ liệu trả về cho frontend
    const formattedData = {
      orderId: order.orderId,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      fullName: order.fullName,
      phone: order.phone,
      address: order.address,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product?.name || "Sản phẩm",
        image: item.product?.image || "",
        price: item.price,
        quantity: item.quantity,
      })),
    };

    return {
      EM: "Lấy thông tin đơn hàng thành công!",
      EC: 0,
      DT: formattedData,
    };
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn:", error);
    return {
      EM: "Lỗi máy chủ khi lấy chi tiết đơn!",
      EC: -1,
      DT: null,
    };
  }
};

// 3. Lấy lịch sử đơn hàng của người dùng (Dùng cho trang OrderHistoryPage)
const getOrderHistoryService = async (userId) => {
  try {
    const orders = await Order.findAll({
      where: userId ? { userId } : {}, // Nếu truyền userId thì lọc theo user
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      fullName: order.fullName,
      phone: order.phone,
      address: order.address,
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product?.name || "Sản phẩm",
        image: item.product?.image || "",
        price: item.price,
        quantity: item.quantity,
      })),
    }));

    return {
      EM: "Lấy lịch sử đơn hàng thành công!",
      EC: 0,
      DT: formattedOrders,
    };
  } catch (error) {
    console.error("Lỗi lấy lịch sử đơn hàng:", error);
    return {
      EM: "Lỗi máy chủ khi lấy lịch sử đơn hàng!",
      EC: -1,
      DT: null,
    };
  }
};

const getAllOrdersService = async () => {
  return getOrderHistoryService(null);
};

const updateOrderStatusService = async (orderId, status) => {
  const allowedStatuses = ["pending", "completed", "cancelled"];

  if (!orderId || !allowedStatuses.includes(status)) {
    return {
      EM: "Trạng thái đơn hàng không hợp lệ!",
      EC: 1,
      DT: null,
    };
  }

  try {
    return await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!order) {
        return {
          EM: "Không tìm thấy đơn hàng!",
          EC: 2,
          DT: null,
        };
      }

      if (status === "completed" && !order.salesCountApplied) {
        const items = await OrderItem.findAll({
          where: { orderId },
          attributes: ["productId", "quantity"],
          transaction,
        });
        const quantityByProduct = new Map();

        for (const item of items) {
          quantityByProduct.set(
            item.productId,
            (quantityByProduct.get(item.productId) || 0) + item.quantity,
          );
        }

        for (const [productId, quantity] of quantityByProduct) {
          await Product.increment("sold", {
            by: quantity,
            where: { id: productId },
            transaction,
          });
        }

        order.salesCountApplied = true;
      }

      await order.update(
        { status, salesCountApplied: order.salesCountApplied },
        { transaction },
      );

      return {
        EM: "Cập nhật trạng thái đơn hàng thành công!",
        EC: 0,
        DT: {
          orderId: order.orderId,
          status: order.status,
          updatedAt: order.updatedAt,
        },
      };
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
    return {
      EM: "Lỗi máy chủ khi cập nhật trạng thái đơn hàng!",
      EC: -1,
      DT: null,
    };
  }
};

module.exports = {
  createOrderService,
  getOrderDetailService,
  getOrderHistoryService,
  getAllOrdersService,
  updateOrderStatusService,
};
