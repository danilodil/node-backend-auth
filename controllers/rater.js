const Boom = require('boom');
const Rater = require('../models/rater');

module.exports={
    saveRating:async(req,res,next)=>{
        console.log('Inside saveRating');
    
        let companyId = null;
        let clientId = null;
        if (req.body.decoded_user.user && req.body.decoded_user.user.companyUserId) {
          companyId = req.body.decoded_user.user.companyUserId;
          clientId = req.body.decoded_user.user.id;
        }
      
        if (req.body.decoded_user.client && req.body.decoded_user.client.companyClientId) {
          companyId = req.body.decoded_user.client.companyClientId;
          clientId = req.body.decoded_user.client.id;
        }
    
        if(!companyId && !clientId){
          return next(Boom.badRequest('Invalid Data'));
        }
    
        const existRater = {
          where:{
            companyId,
            clientId,
            vendorName: req.body.vendorName,
          },
        };

        const raterData = await Rater.findOne(existRater);
        if(raterData){
            await raterData.update({
                result: JSON.stringify(req.session.data)
            });              
        }
        else{
            const newRater = {
                companyId,
                clientId,
                vendorName: req.body.vendorName,
                result: JSON.stringify(req.session.data)
              };
             await Rater.create(newRater);
        }
       return next();

      },
      getRating:async(req,res,next) => {
        console.log('Inside getRating');
    
        let companyId = null;
        let clientId = null;
        if (req.body.decoded_user.user && req.body.decoded_user.user.companyUserId) {
          companyId = req.body.decoded_user.user.companyUserId;
          clientId = req.body.decoded_user.user.id;
        }
      
        if (req.body.decoded_user.client && req.body.decoded_user.client.companyClientId) {
          companyId = req.body.decoded_user.client.companyClientId;
          clientId = req.body.decoded_user.client.id;
        }
    
        if(!companyId || !clientId){
          return next(Boom.badRequest('Invalid Data'));
        }
    
        const newRater = {
          where:{
            companyId,
            clientId,
          },
          attributes:['companyId','clientId','vendorName','result','createdAt']
        };
    
        const raterData = await Rater.findOne(newRater);
        if(!raterData){
          return next(Boom.badRequest('Error retrieving rater'));
        }
        
        raterData.result= JSON.parse(raterData.result);
        req.session.data = raterData;
        return next();
      } 
}