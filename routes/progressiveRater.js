const express = require('express');
const asyncHandler = require('express-async-handler');
const DelayedResponse = require('http-delayed-response');

const progressiveRaterController = require('../controllers/progressiveRater');

const router = express.Router();
// app.use(function (req, res) {
//   var delayed = new DelayedResponse(req, res);

//   delayed.on('done', function (results) {
//     // slowFunction responded within 5 seconds
//     console.log('helll....');
//     res.json({hj:'hj'});
//   }).on('cancel', function () {
//     // slowFunction failed to invoke its callback within 5 seconds
//     // response has been set to HTTP 202
//     res.write('sorry, this will take longer than expected...');
//     res.end();
//   });
//   slowFunction(delayed.wait(5000));
// });

router.put('/progressive/de', asyncHandler(async (req, res, next) => {
  var delayed = new DelayedResponse(req, res);
  delayed.on('done', function (results) {
    // slowFunction responded within 5 seconds
    console.log('helll....');
    res.json(req.session.data);
  }).on('cancel', function () {
    // slowFunction failed to invoke its callback within 5 seconds
    // response has been set to HTTP 202
    res.write('sorry, this will take longer than expected...');
    res.end();
  });
  progressiveRaterController.rateDelaware(req,delayed.wait(240000));

}));

// router.put('/progressive/de', asyncHandler(async (req, res, next) => {
//   await progressiveRaterController.rateDelaware(req, res, next);
// }));

router.put('/progressive/al', asyncHandler(async (req, res, next) => {
  await progressiveRaterController.rateAlabama(req, res, next);
}));

module.exports = router;
