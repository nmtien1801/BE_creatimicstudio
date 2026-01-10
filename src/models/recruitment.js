"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recruitment extends Model {
    static associate(models) {}
  }
  Recruitment.init(
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
      modelName: "Recruitment",
    }
  );
  return Recruitment;
};
