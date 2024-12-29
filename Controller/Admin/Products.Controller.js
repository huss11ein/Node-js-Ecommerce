const productModel = require("../../Models/Product.model");
const fs = require("fs");
const categoryModel = require("../../Models/Category.model");
const xlsx = require("xlsx");
const path = require("path");
class Product {
  static addProduct = async (req, res) => {
    try {
      let cat = await categoryModel.findOne({
        name: req.body.category,
      });

      req.body.category = cat.name;

      // req.body.brand = (await brandModel.findOne({ name: req.body.brand }))._id;
      const product = await new productModel(req.body);
      if (req.body.subCategory) {
        product.subCategory = req.body.subCategory;
      }

      await product.save();
      res.status(200).send(product);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static uploadProductImages = async (req, res) => {
    try {
      let paths = [];
      let index = 0;
      let product = await productModel.findOne({ _id: req.params.id });

      await req.files.forEach(async (element) => {
        let image = element.path.split("public/")[1];

        // image = image.replace("\\", "/");
        await product.images.push({ image: image });
        if (index == 0) {
          product.mainImage = await product.images[0].image;
        }

        await product.save();
        index = index + 1;
      });

      res.send();
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
      });
    }
  };

  static updateProduct = async (req, res) => {
    try {
     
  
      if (req.body.quantity == 0) {
        req.body.Status = "Out of Stock";
      } else if(req.body.quantity > 0) {
        req.body.Status = "In stock";
      }
      if (!req.body.Discount) {
        req.body.priceAfterDecount =req.body.price;
      }else{
     req.body.priceAfterDecount = req.body.price -(
        (req.body.Discount / 100) *req.body.price)
     }
 const product = await productModel.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { runValidators: true }
      );
      
      res.status(200).send(product);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static deleteProduct = async (req, res) => {
    try {
      const result = await productModel.findByIdAndDelete(req.params.id);
      if (!result) {
        res.status(404).send("Product not found");
        return;
      }
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static ChangeShowingProduct = async (req, res) => {
    try {
      const product = await productModel.findByIdAndUpdate(req.params.id, {
        showStatus: req.body.showStatus,
      });
      res.send(product);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

  static Allproducts = async (req, res) => {
    try {
      let products = await productModel.find().sort([["order", 1]]);
      res.status(201).send(products);
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };

  static GetOneProduct = async (req, res) => {
    try {
      const product = await productModel.findById(req.params.id)
      res.send(product);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  static getAllImagesOfProduct = async (req, res) => {
    try {
      const product = await productModel.findById(req.params.id);

      res.send(product.images);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  static exportexcel = async (req, res) => {
    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheet_name = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheet_name];
      const data = xlsx.utils.sheet_to_json(sheet);
      const products = await productModel.insertMany(data);
      res.send(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  static deleteImage = async (req, res) => {
    try {
      const product = await productModel.findById(req.params.id);
      let imageName = path.join("public/" + req.body.image);
      if(product.images.length >1){
         await fs.unlink(imageName, (error) => {
        if (error) {
          throw new Error(error);
        }
      });
      product.images = product.images.filter(
        (element) => element.image != req.body.image
      );
        
      product.mainImage = product.images[0].image;
      await product.save();

      }
     
      res.send();
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
}

module.exports = Product;
