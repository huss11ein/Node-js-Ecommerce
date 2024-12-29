const orderModel = require('../../Models/Order.model')
const reviewModel = require('../../Models/review.models')


class review {
    static haveReview = async (req, res)=>{
        try {
            const UserOrder = orderModel.find({userId : req.user._id , reviewed:false , status:"delivered"})
            if(!UserOrder){
                throw new Error ("no review needed for Now")
            }
            res.send(true)

        } catch (error) {
            res.status(400).send(false)
        }
    }
    static ordersdNeedAreview = async (req, res)=>{
        try {
            const UserOrder = await orderModel.find({userId : req.user._id , reviewed:false , status:"delivered"})
            res.send(UserOrder)
            
        } catch (error) {
            res.status(400).send(error.message)
        }
    }
    static writeReview = async (req,res)=>{
        try {
            const UserOrder = await orderModel.findOne({userId : req.user._id , _id: req.body.orderID ,reviewed:false , status:"delivered"})

        let review = await new reviewModel({
            UserID: req.user._id,
            OrderID:req.body.orderID,
            Review : req.body.review
        }).save()
        UserOrder.reviewed = true
        await UserOrder.save()
        res.send(review)
        } catch (error) {
            res.status(400).send(error.message)

        }
        
    }
    static getReviews = async(req,res)=>{
        try {
            let reviews = await reviewModel.find().populate({
                path: "UserID",
                strictPopulate: false,
                select: "name",
              })
              .populate({
                path: "OrderID",
                strictPopulate: false,
             
              });
      
            res.send(reviews)
        } catch (error) {
            res.status(400).send(error.message)

        }
    }

}
module.exports = review