var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    Constants = require('../core/constants');

const MemberStatus = Constants.MemberStatus;


var MemberSchema = require('mongoose').model('user').schema.extend({
    status: {type: MemberStatus, required: false, default: MemberStatus.PROSPECTIVE},
    membershipId: {type: Schema.ObjectId, required: false, ref: 'Membership'},
    validity: {type: Date, required: false},
    smartCardNumber: {type: String, required: false},
    //smartCardId: {type: Schema.ObjectId, required: false, ref: 'Card'},
    smartCardKey:{type: String, required: false},
    creditBalance: {type: Number, required: false, default: 0},
    securityDeposit:{type:Number,required:false}

});

var Member = mongoose.model('member', MemberSchema);


module.exports=Member;