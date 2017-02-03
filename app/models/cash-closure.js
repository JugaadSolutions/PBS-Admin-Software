/**
 * Created by root on 30/1/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var abstract = require('./abstract'),
    Constants = require('../core/constants');

var CashClosureSchema = mongoose.Schema({
    ccId:Number,
    dateTime: {type: Date, required: true,default:Date.now},
    openingBalance:{type:Number,required:true,default:0},
    cashCollected:{type:Number,required:true,default:0},
    bankDeposits:{type:Number,required:true,default:0},
    refund:{type:Number,required:true,default:0},
    closingBalance:{type:Number,required:true,default:0},
    createdAt: {type: Date, required: true,default:Date.now},
    createdBy:{type:Schema.ObjectId, required: false, ref: 'user'}
}, { collection : 'cash-closure' });


var Cash = mongoose.model('cash-closure', CashClosureSchema);

CashClosureSchema.plugin(abstract);

CashClosureSchema.plugin(autoIncrement.plugin,{model:Cash,field:'ccId',startAt: 1, incrementBy: 1});

/*Cash.count({},function (err,count) {
    if(err)
    {
        throw new Error('Cannot able to count cash closure' + err);
    }
    if(count<1)
    {
        var data = {dateTime:new Date()};
        Cash.create(data,function (err) {
            if (err) {
                throw new Error('Cash closer initialization error ' + err);
            }
        });
    }
});*/

module.exports = Cash;