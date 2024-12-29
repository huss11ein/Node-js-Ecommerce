const productModel = require("../../Models/Product.model");
const favModel = require("../../Models/favourite.model");
class fav {
  static addToFav = async (req, res) => {
    try {
      let fav = await favModel.findOne({ UserId: req.user._id });
      if (!fav) {
        fav = new favModel({
          UserId: req.user._id,
          Products: [],
        });
      }
      let product = await productModel.findById(req.params.id);
      let itemIndex = await fav.Products.findIndex(
        (p) => p.product_id == req.params.id
      );
      // if item aready found delete it
      if (itemIndex >= 0) {
        fav.Products.splice(itemIndex, 1);
       
      } else {
        // add product to favourite
        if (product) {
      fav.Products.push({
            product_id: product._id,
         
           
          });
          } else {
          throw new Error("not produsct", product);
        }
      }
     await fav.save(); 
      res.status(201).send();
    } catch (e) {
      res.status(400).send({
        apiStatus: false,
        data: e.message,
        message: "error adding To Fav",
      });
    }
  };
  static showFav = async(req, res)=>{
   try {
    let products = []
    let favlist =await favModel.findOne({ UserId: req.user._id })
    if(favlist){
      for (let element in favlist.Products ){
      
        let product = await productModel.findById(favlist.Products[element].product_id);
        products.push(product  )
      }
      
    }
   
   
    res.send(products)
   } catch (error) {
    res.status(400).send({
      apiStatus: false,
      data: error.message
     
    });
   }
    
  }
}

module.exports = fav;
