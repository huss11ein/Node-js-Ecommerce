const fs = require("fs");
const appRoot = require("app-root-path");
const productModel = require('../Models/Product.model')
module.exports = {
  async up(){
    let Jsondata = await JSON.parse(
      fs.readFileSync (appRoot,"jsonData/products.json", "utf16le")
    );
    await productModel.insertMany(Jsondata)
  }
  ,
};
