"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserCutVideo extends Model {
    static associate(models) {}
  }
  UserCutVideo.init(
    {
      userName: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserCutVideo",
    },
  );
  return UserCutVideo;
};
