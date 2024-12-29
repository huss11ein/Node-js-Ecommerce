const categoryModel = require("../../Models/Category.model");
const productmodel = require("../../Models/Product.model");
const fs = require("fs");
const path = require("path");
const { off } = require("../../Models/Order.model");
class Category {
  static addCategory = async (req, res) => {
    const category = await categoryModel(req.body);
    try {
      await category.save();

      res.status(201).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static addSubCategory = async (req, res) => {
    try {
      const category = await categoryModel.findById(req.params.id);
      const subCategoryName = req.body.subCategoryName;

      if (category) {
        const subCategoryExists = category.subCategoies.some(
          (subCat) => subCat.subCategory === subCategoryName
        );

        if (subCategoryExists) {
          throw new Error(`${subCategoryName} aready exists`);
        } else {
          category.subCategoies.push({ subCategory: subCategoryName });
          await category.save();
        }
      } else {
        throw new Error("Category not found");
      }

      res.status(201).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static DeleteSubCategory = async (req, res) => {
    try {
      if (!req.body.subCategory) {
        throw new Error("please choose sub category to delete ");
      }
      const category = await categoryModel.findOne({ _id: req.params.id });
      const product = await productmodel.find({
        subCategory: req.body.subCategory,
      });
      if (product.length != 0) {
        throw new Error(
          "There are products using this category , can't delete it"
        );
      }
      if (category) {
        let subcat = category.subCategoies.filter(
          (e) => e.subCategory != req.body.subCategory
        );
        category.subCategoies = subcat;

        await category.save();
      } else {
        throw new Error("category not found");
      }

      res.status(201).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static getsubCategory = async (req, res) => {
    try {
      const category = await categoryModel.findById(req.params.id);
      req.params.id = "";
      res.status(201).send(category.subCategoies);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static getCategory = async (req, res) => {
    try {
      const category = await categoryModel.find();

      res.status(201).send(category);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static getOneCategory = async (req, res) => {
    try {
      const category = await categoryModel.findById(req.params.id);
      res.status(201).send(category);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static updateCategory = async (req, res) => {
    try {
      const oldcategory = await categoryModel.findById(req.params.id);
      const brand = await categoryModel.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        {
          returnDocument: "after",
        }
      );
      const product = await productmodel.updateMany(
        { category: oldcategory.name },
        { $set: { category: brand.name } }
      );
      res.status(200).send(brand);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static deleteCategory = async (req, res) => {
    try {
      const oldcategory = await categoryModel.findById(req.params.id);

      if (!oldcategory) {
        res.status(200).send({ data: "Category not found" });
        return;
      }
      const product = await productmodel.find({ category: oldcategory.name });
      if (product.length != 0) {
        throw new Error(
          "There are products using this category , can't delete it"
        );
      }
      const result = await categoryModel.findByIdAndDelete(req.params.id);
      if (!result) {
        res.status(200).send({ data: "Category not found" });
        return;
      }
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static uploadCategoryImage = async (req, res) => {
    try {
      let category = await categoryModel.findOne({ _id: req.params.id });

      if (category.image != null) {
        await fs.unlink(path.join("public/" + category.image), (error) => {
          if (error) {
            throw new Error(error);
          }
        });
      }
      category.image = req.files[0].path.split("public/")[1].replace("/", "/");
      await category.save();

      res.send();
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
      });
    }
  };
}

module.exports = Category;
