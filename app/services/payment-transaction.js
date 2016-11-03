var async = require('async'),
MembershipService=require('../services/membership-service'),
    Transaction=require('../services/payment-transaction'),
    Membership  = require('../models/membership'),
    Stations = require('../models/station'),
    Member = require('../models/member'),
    Payments = require('../models/payment-transactions'),
    Constants=require('../core/constants');

exports.signedUp = function (record,memberObject,callback) {
    var memberShipObject=0;
    var finalTransaction=0;
    var transactionList=[];
    var validity;
    var updatedMember;
    async.series([
        function (callback) {
            Membership.findById(memberObject.membershipId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                memberShipObject = result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(memberShipObject!=0)
            {

                var securityObject;
                var sd = 'PBS'+ new Date().getTime();
                record.credit=record.credit-memberShipObject.securityDeposit;
                securityObject={
                    memberId:memberObject._id,
                    invoiceNo: sd,
                    paymentDescription:Constants.PayDescription.SECURITY_DEPOSIT,
                    paymentMode:record.creditMode,
                    paymentThrough:Constants.PayThrough.POS,
                    gatewayTransactionId:record.transactionNumber,
                    comments:record.comments,
                    debit:memberShipObject.securityDeposit,
                    balance:record.credit
                };

                var cardObject;
                var cd = 'PBS'+ new Date().getTime();
                record.credit=record.credit-memberShipObject.smartCardFees;
                cardObject={
                    memberId:memberObject._id,
                    invoiceNo: cd,
                    paymentDescription:Constants.PayDescription.SMART_CARD_FEE,
                    paymentMode:record.creditMode,
                    paymentThrough:Constants.PayThrough.POS,
                    gatewayTransactionId:record.transactionNumber,
                    comments:record.comments,
                    debit:memberShipObject.smartCardFees,
                    balance:record.credit
                };

                transactionList.push(securityObject);
                transactionList.push(cardObject);
                if(memberShipObject.processingFees!=0)
                {
                    var processingObject;
                    var ps = 'PBS'+ new Date().getTime();
                    record.credit=record.credit-memberShipObject.processingFees;
                    processingObject={
                        memberId:memberObject._id,
                        invoiceNo: ps,
                        paymentDescription:Constants.PayDescription.PROCESSING_FEE,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.processingFees,
                        balance:record.credit
                    };
                    transactionList.push(processingObject);

                }
                return callback(null,null);

            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(transactionList.length>0)
            {
                for(var i=0;i<transactionList.length;i++)
                {
                    Payments.create(transactionList[i],function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        finalTransaction=result;
                    });
                }
            }
            return callback(null,null);
        },
        function (callback) {
            if(finalTransaction!=0)
            {
                MembershipService.calculateValidity(memberObject.membershipId, memberObject._id, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    validity = result;
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            if(finalTransaction!=0)
            {
                Member.findByIdAndUpdate(memberObject._id,{
                    $set: {
                        'validity': validity,
                        'processingFeesDeducted':true,
                        'creditBalance':finalTransaction.balance,
                        'securityDeposit':memberShipObject.securityDeposit,
                        'smartCardFees': memberShipObject.smartCardFees,
                        'processingFees':memberShipObject.processingFees
                    }
                },function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    updatedMember=result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,updatedMember);
    });

};

exports.existingMember = function (memberObject,record,callback) {


    var validity;
    var transObject;
    var transactionDetails;
    var orderId = 'PBS'+ new Date().getTime();
   async.series([
    function (callback) {
        transObject={
            memberId:memberObject._id,
            invoiceNo: orderId,
            paymentDescription:Constants.PayDescription.CREDIT_NOTE,
            paymentMode:(record.creditMode==null)?Constants.PayMode.NET_BANKING:record.creditMode,
            paymentThrough:Constants.PayThrough.PAYMENT_GATEWAY,
            gatewayTransactionId:record.transactionNumber,
            comments:record.comments,
            credit:record.credit,
            balance:record.credit
        };
        Payments.create(transObject,function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            transactionDetails=result;
            return callback(null,result);
        });
    },
       /*//Method to calculate validity
       function (callback) {
           MembershipService.calculateValidity(membershipId, memberId, function (err, result) {

               if (err) {
                   return callback(err, null);
               }

               validity = result;
               return callback(null, result);
           });
       },*/
       function (callback) {
           memberObject.creditBalance = Number(memberObject.creditBalance+transactionDetails.balance);
           Member.findByIdAndUpdate(memberObject._id,memberObject,function (err,result) {
               if(err)
               {
                   return callback(err,null);
               }
               return callback(null,result);
           });
       }

   ],function(err,result){
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,result);
   });

};

exports.newMember = function (memberObject,record,callback) {
    var memberShipObject=0;
    var finalTransaction=0;
    var transactionList=[];
    var validity;
    var updatedMember;
    async.series([
        function (callback) {
            Membership.findById(memberObject.membershipId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                memberShipObject = result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(memberShipObject!=0)
            {
                    var userfeeDeposit;
                    var uf = 'PBS'+ new Date().getTime();
                    userfeeDeposit={
                        memberId:memberObject._id,
                        invoiceNo: uf,
                        paymentDescription:Constants.PayDescription.CREDIT_NOTE,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        credit:record.credit,
                        balance:record.credit
                    };

                    var securityObject;
                    var sd = 'PBS'+ new Date().getTime();
                        record.credit=record.credit-memberShipObject.securityDeposit;
                    securityObject={
                        memberId:memberObject._id,
                        invoiceNo: sd,
                        paymentDescription:Constants.PayDescription.SECURITY_DEPOSIT,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.securityDeposit,
                        balance:record.credit
                    };

                    var cardObject;
                    var cd = 'PBS'+ new Date().getTime();
                    record.credit=record.credit-memberShipObject.smartCardFees;
                    cardObject={
                        memberId:memberObject._id,
                        invoiceNo: cd,
                        paymentDescription:Constants.PayDescription.SMART_CARD_FEE,
                        paymentMode:record.creditMode,
                        paymentThrough:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.smartCardFees,
                        balance:record.credit
                    };
                    transactionList.push(userfeeDeposit);
                    transactionList.push(securityObject);
                    transactionList.push(cardObject);
                    if(memberShipObject.processingFees!=0)
                    {
                        var processingObject;
                        var ps = 'PBS'+ new Date().getTime();
                        record.credit=record.credit-memberShipObject.processingFees;
                        processingObject={
                            memberId:memberObject._id,
                            invoiceNo: ps,
                            paymentDescription:Constants.PayDescription.PROCESSING_FEE,
                            paymentMode:record.creditMode,
                            paymentThrough:Constants.PayThrough.POS,
                            gatewayTransactionId:record.transactionNumber,
                            comments:record.comments,
                            debit:memberShipObject.processingFees,
                            balance:record.credit
                        };
                        transactionList.push(processingObject);

                    }
                    return callback(null,null);

            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(transactionList.length>0)
            {
                for(var i=0;i<transactionList.length;i++)
                {
                    Payments.create(transactionList[i],function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        finalTransaction=result;
                    });
                }
            }
            return callback(null,null);
        },
        function (callback) {
            if(finalTransaction!=0)
            {
                MembershipService.calculateValidity(memberObject.membershipId, memberObject._id, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    validity = result;
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            if(finalTransaction!=0)
            {
                Member.findByIdAndUpdate(memberObject._id,{
                    $set: {
                        'validity': validity,
                        'processingFeesDeducted':true,
                        'creditBalance':finalTransaction.balance,
                        'securityDeposit':memberShipObject.securityDeposit,
                        'smartCardFees': memberShipObject.smartCardFees,
                        'processingFees':memberShipObject.processingFees
                    }
                },function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    updatedMember=result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,updatedMember);
    });
};

exports.daywiseCollection = function (record,callback) {
   // Payments.find({});
};

exports.dashboardDetails=function (callback) {
    var dasboardDetails = {
        memberships:"",
        registrations:"",
        casualUsers:"",
        cash:"",
        pos:"",
        paymentGateway:"",
        registrationCenter:[]
    };
    var allMembers;
    var membership;
    var payments;
    var cashSum=0,posSum=0,gatewaySum=0;

    async.series([
        
        function (callback) {
            Member.count({"status":1},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                allMembers=result;
                return callback(null,result);
            });
        },
            function (callback) {
                Membership.findOne({'subscriptionType':'Causal'},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    membership = result;
                    return callback(null,result);
                });
            }
        ,
        function (callback) {
           /* Member.count({"membershipId.subscriptionType":"Causal"},function (err,result) {*/
            Member.count({'membershipId':membership._id},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                dasboardDetails.casualUsers=result;
                dasboardDetails.memberships = Number(allMembers-result);
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            Member.count({"_type":"member"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                dasboardDetails.registrations=result;
                return callback(null,result);
            });
        },
        function (callback) {
            Payments.find({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                payments=result;
                for(var i=0;i<result.length;i++)
                {
                    var obj = result[i];
                    if(obj.paymentMode==Constants.PayMode.CASH)
                    {
                        cashSum=Number(cashSum+obj.credit);
                    }
                    else if(obj.paymentMode==Constants.PayMode.CREDIT_CARD || obj.paymentMode==Constants.PayMode.DEBIT_CARD)
                    {
                        posSum = Number(posSum+obj.credit);
                    }
                    else
                    {
                        gatewaySum = Number(gatewaySum+obj.credit);
                    }
                }
                dasboardDetails.cash=cashSum;
                dasboardDetails.pos=posSum;
                dasboardDetails.paymentGateway=gatewaySum;
                return callback(null,result);
            });
        },
        function (callback) {
            if(payments)
            {
                Stations.find({'stationType':'registration-center'},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    var regDetails={};
                    for(var k=0;k<result.length;k++)
                    {
                        var a = result[k];
                        regDetails[a.location]=0;
                    }
                    for(var i=0;i<result.length;i++)
                    {
                        var data = result[i];

                        for(var j=0;j<payments.length;j++)
                        {
                            var d2 = payments[j];
                            if(data.location==d2.location)
                            {
                                regDetails[data.location]=Number(regDetails[data.location]+d2.credit);
                               // regDetails['amount']=regDetails['amount']+payments.credit;
                            }
                        }

                    }
                    dasboardDetails.registrationCenter.push(regDetails);
                    return callback(null,result);
                });
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,dasboardDetails);
    });
};