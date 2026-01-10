"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {}
  }
  Post.init(
    {
      title: DataTypes.STRING,
      image: DataTypes.STRING,
      description: DataTypes.TEXT,
      detail: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,

      userUpdate: DataTypes.STRING,
      userCreate: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
