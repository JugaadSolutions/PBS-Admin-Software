var async = require('async'),
    moment = require('moment'),
    MembershipService=require('../services/membership-service'),
    Membership  = require('../models/membership'),
    User = require('../models/user'),
    Stations = require('../models/station'),
    RegCenter = require('../models/registration-center'),
    Topup = require('../models/topup-plan'),
    Member = require('../models/member'),
    Deposits = require('../models/deposits'),
    GlobalSettings = require('../models/global-settings'),
    Payments = require('../models/payment-transactions'),
    Cashclosure = require('../models/cash-closure'),
    RequestHandler = require('../handlers/ccavRequestHandler'),
    Constants=require('../core/constants');

exports.signedUp = function (record,memberObject,callback) {
    var memberShipObject;
    var finalTransaction;
    var transactionList=[];
    var validity;
    var updatedMember;
    var location;
    async.series([
        function (callback) {
            Membership.findById(memberObject.membershipId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                memberShipObject = result;
                var payValue = Number(memberShipObject.userFees+memberShipObject.securityDeposit+memberShipObject.smartCardFees+memberShipObject.processingFees);
                if(record.credit<payValue)
                {
                    return callback(new Error('Amount you entered is less than Minimum Amount'),null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    location = 'Other Location';
                    return callback(null,result);
                }
                location=result.location;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(memberShipObject)
            {

                var securityObject;
                var sd = 'PBS'+ new Date().getTime();
                record.credit=record.credit-memberShipObject.securityDeposit;
                securityObject={
                    memberId:memberObject._id,
                    invoiceNo: sd,
                    paymentDescription:Constants.PayDescription.SECURITY_DEPOSIT,
                    paymentMode:record.creditMode,
                    paymentThrough:(record.creditMode=='Cash')?record.creditMode:Constants.PayThrough.PAYMENT_GATEWAY,
                    gatewayTransactionId:record.transactionNumber,
                    comments:record.comments,
                    debit:memberShipObject.securityDeposit,
                    balance:record.credit,
                    location:(location!=null)?location:'Other Location',
                    createdBy:record.createdBy
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
                    balance:record.credit,
                    location:(location!=null)?location:'Other Location',
                    createdBy:record.createdBy
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
                        balance:record.credit,
                        location:(location!=null)?location:'Other Location',
                        createdBy:record.createdBy
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
                /* var i;
                 for(i=0;i<transactionList.length;i++)
                 {*/
                Payments.create(transactionList,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    finalTransaction=result;
                    /*console.log(i);
                     if(i==transactionList.length-1)
                     {*/
                    return callback(null,result);
                    //}
                });
                // }

            }
            else
            {
                return callback(null,memberObject);
            }

        }/*,
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
        }*/
        ,
        function (callback) {
            if(finalTransaction)
            {
                var len = finalTransaction.length-1;
                Member.findByIdAndUpdate(memberObject._id,{
                    $set: {
                        'validity': validity,
                        'processingFeesDeducted':true,
                        'creditBalance':finalTransaction[len].balance,
                        'securityDeposit':memberShipObject.securityDeposit,
                        'smartCardFees': memberShipObject.smartCardFees,
                        'processingFees':memberShipObject.processingFees
                    }
                },{new:true},function (err,result) {
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
    var memberDetails;
    var membershipDetails;
    var membershipType;
    var location;
    var orderId = 'PBS'+ new Date().getTime();
   async.series([
       function (callback) {
           RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,result) {
               if(err)
               {
                   return callback(err,null);
               }
               if(!result)
               {
                   location = 'Other Location';
                   return callback(null,result);
               }
               location=result.location;
               return callback(null,result);
           });
       }
       ,
    function (callback) {
        transObject={
            memberId:memberObject._id,
            invoiceNo: orderId,
            paymentDescription:Constants.PayDescription.CREDIT_NOTE,
            paymentMode:(record.creditMode==null)?Constants.PayMode.NET_BANKING:record.creditMode,
            paymentThrough:(record.creditMode==Constants.PayThrough.CASH)?Constants.PayThrough.CASH:Constants.PayThrough.PAYMENT_GATEWAY ,
            gatewayTransactionId:record.transactionNumber,
            comments:record.comments,
            credit:record.credit,
            balance:record.credit,
            location:(location!=null)?location:'Other Location',
            createdBy:record.createdBy
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

           Member.findOne({_id:memberObject._id},function (err,result) {
               if(err)
               {
                   return callback(err,null);
               }

               result.creditBalance = Number(result.creditBalance+transactionDetails.balance);
               memberDetails  = result;
               Member.update({_id:result._id}, result, {new: true}).lean().exec(function (err, result) {
                   if (err) {
                       return callback(err, null);
                   }
                    return callback(null,result);
               });
           });

       },
       function (callback) {


           Membership.find({},function (err,result) {
               if(err)
               {
                   return callback(err,null);
               }

               if(result.length>0)
               {
                   membershipDetails = result;
                   for(var i=0;i<result.length;i++)
                   {
                       var mShip = result[i];
                       if(mShip._id==memberDetails.membershipId)
                       {
                           if(mShip.processingFees>0)
                           {
                               membershipType = 'Causal user';
                               break;
                           }
                       }

                   }
                   return callback(null,null);
               }
               else
               {
                   return callback(null,result);
               }
           });
       }
       ,
       function (callback) {
           if(membershipType =='Causal user')
           {
               return callback(null,null);
           }
           else
           {
               if(transactionDetails.balance>=200 && transactionDetails.balance<400)
               {
                   for(var i=0;i<membershipDetails.length;i++)
                   {
                       var memShip = membershipDetails[i];
                       if(memShip.userFees==200)
                       {
                            memberDetails.membershipId = memShip._id;
                            var dur = moment(memberDetails.validity).diff(moment(),'days');
                           if(dur>=0)
                           {
                               memberDetails.validity = moment(memberDetails.validity).add(memShip.validity,'days');
                               break;
                           }
                           else
                           {
                               memberDetails.validity = moment().add(memShip.validity,'days');
                               break;
                           }
                       }
                   }
                   Member.update({_id:memberDetails._id}, memberDetails, {new: true}).lean().exec(function (err, result) {
                       if (err) {
                           return callback(err, null);
                       }
                       return callback(null,result);
                   });
               }
               else if(transactionDetails.balance>=400 && transactionDetails.balance<1000)
               {
                   for(var i=0;i<membershipDetails.length;i++)
                   {
                       var memShip = membershipDetails[i];
                       if(memShip.userFees==400)
                       {
                           memberDetails.membershipId = memShip._id;
                           var dur = moment(memberDetails.validity).diff(moment(),'days');
                           if(dur>=0)
                           {
                               memberDetails.validity = moment(memberDetails.validity).add(memShip.validity,'days');
                               break;
                           }
                           else
                           {
                               memberDetails.validity = moment().add(memShip.validity,'days');
                               break;
                           }
                       }
                   }
                   Member.update({_id:memberDetails._id}, memberDetails, {new: true}).lean().exec(function (err, result) {
                       if (err) {
                           return callback(err, null);
                       }
                       return callback(null,result);
                   });
               }
               else if(transactionDetails.balance>=1000)
               {
                   for(var i=0;i<membershipDetails.length;i++)
                   {
                       var memShip = membershipDetails[i];
                       if(memShip.userFees==1000)
                       {
                           memberDetails.membershipId = memShip._id;
                           var dur = moment(memberDetails.validity).diff(moment(),'days');
                           if(dur>=0)
                           {
                               memberDetails.validity = moment(memberDetails.validity).add(memShip.validity,'days');
                               break;
                           }
                           else
                           {
                               memberDetails.validity = moment().add(memShip.validity,'days');
                               break;
                           }
                       }
                   }
                   Member.update({_id:memberDetails._id}, memberDetails, {new: true}).lean().exec(function (err, result) {
                       if (err) {
                           return callback(err, null);
                       }
                       return callback(null,result);
                   });
               }
               else
               {
                   return callback(null,null);
               }
           }
       }
   ],function(err,result){
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,memberDetails);
   });

};

exports.topUp = function (memberObject,record,callback) {

    var transObject;
    var transactionDetails;
    var memberDetails;
    var membershipDetails;
    var membershipType;
    var location;
    var orderId = 'PBS'+ new Date().getTime();
    var topupDetails;

    async.series([
        function (callback) {
            RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    location = 'Other Location';
                    return callback(null,result);
                }
                location=result.location;
                return callback(null,result);
            });
        },
        function (callback) {
            Topup.findOne({topupId:record.credit},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                topupDetails = result;
                record.credit = result.userFees;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            transObject={
                memberId:memberObject._id,
                invoiceNo: orderId,
                paymentDescription:Constants.PayDescription.TOPUP,
                paymentMode:(record.creditMode==null)?Constants.PayMode.NET_BANKING:record.creditMode,
                paymentThrough:(record.creditMode==Constants.PayThrough.CASH)?Constants.PayThrough.CASH:Constants.PayThrough.PAYMENT_GATEWAY ,
                gatewayTransactionId:record.transactionNumber,
                comments:record.comments,
                credit:record.credit,
                balance:record.credit,
                location:(location!=null)?location:'Other Location',
                createdBy:record.createdBy
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
        function (callback) {
            memberObject.creditBalance = Number(memberObject.creditBalance+topupDetails.userFees);
            var dur = moment(memberObject.validity).diff(moment(),'days');
            if(dur>=0)
            {
                memberObject.validity = moment(memberObject.validity).add(topupDetails.validity,'days');
            }
            else
            {
                memberObject.validity = moment().add(topupDetails.validity,'days');
            }
            Member.update({_id:memberObject._id}, memberObject, {new: true}).lean().exec(function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberObject);
    });
};

exports.newMember = function (memberObject,record,callback) {
    var memberShipObject;
    var finalTransaction;
    var paymentBalance;
    var transactionList=[];
    var location;

    var updatedMember;
    async.series([
        function (callback) {
            Membership.findById(memberObject.membershipId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                memberShipObject = result;
                var payValue = Number(memberShipObject.userFees+memberShipObject.securityDeposit+memberShipObject.smartCardFees+memberShipObject.processingFees);
                if(record.credit<payValue)
                {
                    return callback(new Error('Amount you entered is less than Minimum Amount'),null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    location = 'Other Location';
                    return callback(null,result);
                }
                location=result.location;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(memberShipObject)
            {
                    var userfeeDeposit;
                    var uf = 'PBS'+ new Date().getTime();
                    userfeeDeposit={
                        memberId:memberObject._id,
                        invoiceNo: uf,
                        paymentDescription:Constants.PayDescription.REGISTRATION,
                        paymentMode:record.creditMode,
                        paymentThrough:(record.creditMode=='Cash')?record.creditMode:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        credit:record.credit,
                        balance:record.credit,
                        location:(location!=null)?location:'Other Location',
                        createdBy:record.createdBy

                    };

                    var securityObject;
                    var sd = 'PBS'+ new Date().getTime();
                        record.credit=record.credit-memberShipObject.securityDeposit;
                    securityObject={
                        memberId:memberObject._id,
                        invoiceNo: sd,
                        paymentDescription:Constants.PayDescription.SECURITY_DEPOSIT,
                        paymentMode:record.creditMode,
                        paymentThrough:(record.creditMode=='Cash')?record.creditMode:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.securityDeposit,
                        balance:record.credit,
                        location:(location!=null)?location:'Other Location',
                        createdBy:record.createdBy
                    };

                    var cardObject;
                    var cd = 'PBS'+ new Date().getTime();
                    record.credit=record.credit-memberShipObject.smartCardFees;
                    cardObject={
                        memberId:memberObject._id,
                        invoiceNo: cd,
                        paymentDescription:Constants.PayDescription.SMART_CARD_FEE,
                        paymentMode:record.creditMode,
                        paymentThrough:(record.creditMode=='Cash')?record.creditMode:Constants.PayThrough.POS,
                        gatewayTransactionId:record.transactionNumber,
                        comments:record.comments,
                        debit:memberShipObject.smartCardFees,
                        balance:record.credit,
                        location:(location!=null)?location:'Other Location',
                        createdBy:record.createdBy
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
                            paymentThrough:(record.creditMode=='Cash')?record.creditMode:Constants.PayThrough.POS,
                            gatewayTransactionId:record.transactionNumber,
                            comments:record.comments,
                            debit:memberShipObject.processingFees,
                            balance:record.credit,
                            location:(location!=null)?location:'Other Location',
                            createdBy:record.createdBy
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
               /* var i;
                for(i=0;i<transactionList.length;i++)
                {*/
                    Payments.create(transactionList,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        finalTransaction=result;
                        /*console.log(i);
                        if(i==transactionList.length-1)
                        {*/
                            return callback(null,result);
                        //}
                    });
               // }

            }
            else
            {
                return callback(null,memberObject);
            }

        }/*,
        function (callback) {
            if(finalTransaction)
            {
                Payments.find({'invoiceNo':finalTransaction[0].invoiceNo},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    paymentBalance=result[0].balance;
                    for(var i=1;i<result.length;i++)
                    {
                        if(paymentBalance>result[i].balance)
                        {
                            paymentBalance = result[i].balance;
                        }
                    }

                    return callback(null,result);
                });
            }
        }*/
        ,

        function (callback) {
            if(finalTransaction)
            {
                var len = finalTransaction.length-1;
                Member.findByIdAndUpdate(memberObject._id,{
                    $set: {
                        'processingFeesDeducted':true,
                        'creditBalance':finalTransaction[len].balance,
                        'securityDeposit':memberShipObject.securityDeposit,
                        'smartCardFees': memberShipObject.smartCardFees,
                        'processingFees':memberShipObject.processingFees
                    }
                },{new:true},function (err,result) {
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

   /* var trans = [];
    async.series([*/
/*        function (callback) {
            var dateArray = [];
            //console.log(moment(record.fromdate));
            //console.log(moment(record.todate));
            var currentDate = moment(record.fromdate);
            while (currentDate <= moment(record.todate)) {
                var details={
                    date:'',
                    cash:0,
                    pos:0,
                    gateway:0
                };
                details.date=moment(currentDate).format('YYYY-MM-DD');
                trans.push(details);
                //trans.push(dateArray);
                currentDate = moment(currentDate).add(1, 'days');
            }
            return callback(null,dateArray);
        },
        function (callback) {*/

            if(record.location=='All')
            {
                var payDetails;
                var ldate = moment(record.todate).add(1, 'days');
                ldate=ldate.format('YYYY-MM-DD');
                //console.log(ldate);
                Payments.find({'createdAt':{$gte:moment(record.fromdate),$lte:moment(ldate)},"paymentDescription": record.transactionType}).sort('-createdAt').deepPopulate('memberId').lean().exec(function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    payDetails = result;
                    //trans.push(result);
                    return callback(null,result);
                });
            }
            else
            {
                var payDetails;
                var ldate = moment(record.todate).add(1, 'days');
                ldate=ldate.format('YYYY-MM-DD');
                //console.log(ldate);
                Payments.find({'createdAt':{$gte:moment(record.fromdate),$lte:moment(ldate)},"paymentDescription": record.transactionType,'location':record.location}).sort('-createdAt').deepPopulate('memberId').lean().exec(function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    payDetails = result;
                    //trans.push(result);
                    return callback(null,result);
                });
            }

/*        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });*/
/*
    var daywiseDetails=[];
    var daywise={
        date:[],
        alldetails:[]
    };

    async.series([
        function (callback) {
            console.log('From date = '+record.fromDateTime+' To date = '+record.toDateTime);
            console.log(!moment(record.fromDateTime).isAfter(moment(record.toDateTime)));
            console.log(!moment(record.fromDateTime).isAfter(moment()));
            console.log(!moment(record.toDateTime).isAfter(moment()));
            if(!moment(record.fromDateTime).isAfter(record.toDateTime)&& !moment(record.fromDateTime).isAfter(moment()) && !moment(record.toDateTime).isAfter(moment()))
            {

                var durationMin = moment.duration(moment(record.toDateTime).diff(moment(record.fromDateTime)));
                //console.log(durationMin);
                var days = durationMin.asDays();
                console.log(days);
                var fday = moment(record.fromDateTime);
                for(var i=0;i<days+1;i++)
                {

                    Payments.find({'createdAt':{$eq:moment(fday)},'paymentDescription':Constants.PayDescription.CREDIT_NOTE}).lean().exec(function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        daywise.alldetails.push(result);

                        var eachData={
                            day:'',
                            cash:0,
                            creditCard:0,
                            gateway:0
                        };
                        eachData.day=fday;
                        for(var i=0;i<result.length;i++)
                        {
                            var data = result[i];
                            if(data.paymentMode==Constants.PayMode.CASH)
                            {
                                eachData.cash=Number(eachData.cash+result.balance);
                            }
                            else if(data.paymentMode==Constants.PayMode.CREDIT_CARD||data.paymentMode==Constants.PayMode.DEBIT_CARD)
                            {
                                eachData.creditCard=Number(eachData.creditCard+result.balance);
                            }
                            else
                            {
                                eachData.gateway=Number(eachData.gateway+result.balance);
                            }
                        }
                        daywise.date.push(eachData);
                        // return callback(null,result);
                    });
                    if(moment(fday).isSameOrBefore(moment(record.toDateTime)))
                    {
                        fday.add(1,'days');
                    }

                }
                return callback(null,daywise);
            }
            else
            {
                return callback(new Error('From Date cannot be greater than today and To Date'),null);
            }
        }

    ],function (err,result) {
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,result);
    });

   // Payments.find({});*/
};

exports.cashCollection = function (record,callback) {

    var allDetails;
    var payDetails;
    var temp=[];
    async.series([
        function (callback) {
            Payments.find({'createdAt':{$gte:moment(record.fromDateTime),$lte:moment(record.toDateTime)},'location':record.location},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                payDetails = result;
                return callback(null,result);
            });
        }/*,
        function (callback) {
            if(payDetails)
            {
                for(var i=0;i<payDetails.length;i++)
                {
                    if(payDetails[i].location==record.location && payDetails[i].paymentDescription=='Credit note')
                    {
                        temp.push(payDetails[i]);
                    }
                }
                return callback(null,payDetails);
            }
            else
            {
                return callback(null,null);
            }
        }*/
/*        function (callback) {
            Payments.find({'location':record.location},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }*/
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};
/*
exports.cashCollection = function (record,callback) {
    var payments;
    var registrationCenter=[];
    var total={amount:0};
    async.series([
        function (callback) {
            Payments.find({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                payments=result;
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
                                total.amount=total.amount+d2.credit;
                            }
                        }

                    }
                    registrationCenter.push(regDetails);
                    registrationCenter.push(total);
                    return callback(null,result);
                });
            }
        },
        function (callback) {
            Payments.find({'createdAt':{$gte:moment(record.fromDateTime),$lte:moment(record.toDateTime)},"paymentDescription": "Credit note"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                var alldetails={};
                alldetails['transactions']=result;
                registrationCenter.push(alldetails);
                return callback(null,result);
            });
        }
    ],function (err,result) {
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,registrationCenter);
    });
};
*/

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

exports.depositCash = function (record,callback) {
    Deposits.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.depositInfo = function (record,callback) {
    if(record.location=='All')
    {
        Deposits.find({'depositDate':{$gte:moment(record.fromdate),$lte:moment(record.todate)}},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        Deposits.find({'depositDate':{$gte:moment(record.fromdate),$lte:moment(record.todate)},'location':record.location},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
};

exports.totalCollection = totalcash;

function totalcash (record,callback) {

    var dates;

    var trans = [];
    var cash=0,pos=0,gateway=0;
    var payDetails;
    async.series([
        function (callback) {
            /*for(var i=moment(record.fromdate).format('YYYY-MM-DD');i<=moment(record.todate).format('YYYY-MM-DD');i.add('days',1))
            {
                details.date=i;
                trans.push(details);
            }*/
            var dateArray = [];
            //console.log(moment(record.fromdate));
            //console.log(moment(record.todate));
            var currentDate = moment(record.fromdate);
            while (currentDate <= moment(record.todate)) {
                var details={
                    date:'',
                    cash:0,
                    pos:0,
                    gateway:0
                };
                details.date=moment(currentDate).format('YYYY-MM-DD');
                trans.push(details);
                //trans.push(dateArray);
                currentDate = moment(currentDate).add(1, 'days');
            }
            return callback(null,dateArray);
        },
       function (callback) {
           var ldate = moment(record.todate).add(1, 'days');
           ldate=ldate.format('YYYY-MM-DD');
           //console.log(ldate);
           if(record.location=='All')
           {
               Payments.find({'createdAt':{$gte:moment(record.fromdate),$lte:moment(ldate)},'paymentDescription': 'Registration'}).sort('createdAt').lean().exec(function (err,result) {
                   if(err)
                   {
                       return callback(err,null);
                   }
                   payDetails = result;
                   //trans.push(result);
                   return callback(null,result);
               });
           }
           else
           {
               Payments.find({'createdAt':{$gte:moment(record.fromdate),$lte:moment(ldate)},'paymentDescription': 'Registration','location':record.location}).sort('createdAt').lean().exec(function (err,result) {
                   if(err)
                   {
                       return callback(err,null);
                   }
                   payDetails = result;
                   //trans.push(result);
                   return callback(null,result);
               });
           }
        } ,
        function (callback) {
                if(payDetails)
                {
                    for(var i=0;i<trans.length;i++)
                    {
                        var data = trans[i];
                        for(var j=0;j<payDetails.length;j++)
                        {
                            if(moment(data.date).format('YYYY-MM-DD')==moment(payDetails[j].createdAt).format('YYYY-MM-DD'))
                            {

                                if(payDetails[j].paymentThrough==Constants.PayThrough.PAYMENT_GATEWAY)
                                {
                                    data.gateway= data.gateway+Number(payDetails[j].credit);
                                }
                                if(payDetails[j].paymentThrough==Constants.PayThrough.CASH)
                                {
                                    data.cash= data.cash+Number(payDetails[j].credit);
                                }
                                if(payDetails[j].paymentThrough==Constants.PayThrough.POS)
                                {
                                    data.pos= data.pos+Number(payDetails[j].credit);
                                }
                            }
                        }
                    }
                    return callback(null,null);
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
        return callback(null,trans);
    });

}

exports.getAllDeposits = function (callback) {
    Deposits.find({}).sort('-depositDate').exec(function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getMembertrans = function (id,callback) {
    //async.series([],)
    if(isNaN(id))
    {
        Payments.find({'memberId':id,paymentDescription:{$in:['Registration','Credit note']}}).sort('-createdAt').lean().exec(function (err, result) {

            if (err) {

                return callback(err,null)
            }
            return callback(null,result);
        });
    }
    else
    {
        User.findOne({UserID:id},function (err,result) {
            if (err) {
                return callback(err, null);
            }
            Payments.find({'memberId':result._id,paymentDescription:{$in:['Registration','Credit note']}}).sort('-createdAt').lean().exec(function (err, result) {

                if (err) {

                    return callback(err,null)
                }
                return callback(null,result);
            });
        });
    }
};

exports.createcashClosure = function (record,callback) {
    Cashclosure.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getCashclosures = function (record,callback) {
    var ldate = moment(record.todate).add(1, 'days');
    ldate=ldate.format('YYYY-MM-DD');
    Cashclosure.find({dateTime:{$gte:moment(record.fromdate),$lte:moment(ldate)}},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

/*
exports.dayClosure = function (record,callback) {
    var exitCode = 0;
    var cashDetails={
        openingBalance:0,
        cashcollected:0,
        bankdeposit:0,
        refunds:0,
        closingBalance:0
    };
    async.series([
        function (callback) {
            Cashclosure.find({dateTime:{$gte:moment(record.duration)}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result.length>0)
                {
                    exitCode=1;
                    return callback(new Error("Records already exists. Don't need to create new one"),null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(exitCode==0)
            {
                Cashclosure.findOne({}).sort('-dateTime').exec(function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    var t = moment(record.duration).diff(moment(result.dateTime));
                    var dur = t.asDays();
                    if(dur>1)
                    {
                        exitCode=1;
                        var d = moment(result.dateTime).add(1,'days');
                        var f = moment(d).format('YYYY-MM-DD');
                        return callback(new Error("You need to close the record from "+f+". Please complete all previous closures"),null);
                    }else
                    {
                        cashDetails.openingBalance = result.closingBalance;
                        var data={
                            fromdate:record.duration,
                            todate:record.duration,
                            location:'All'
                        };
                        totalcash(data,function (err,result) {
                            if(err)
                            {
                                return callback(err,null)
                            }
                                cashDetails.cashcollected=result.cash;
                            return callback(null,result);
                        });
                    }
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
        return callback(null,result);
    })
};*/

exports.dayClosure = function (callback) {

    var exitState = 0;
    var cashDetails={
        dateinfo:'',
        openingBalance:0,
        cashcollected:0,
        bankdeposit:0,
        refunds:0,
        closingBalance:0
    };
    async.series([
        function (callback) {
            GlobalSettings.findOne({name:'Commissioned-Date'},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    var dur = moment(result.value[0]).subtract(1,'days');
                    Cashclosure.count().exec(function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(result>0)
                        {
                            return callback(null,result);
                        }
                        else
                        {
                            var data = {dateTime:moment(dur)};
                            Cashclosure.create(data,function (err) {
                                if (err) {
                                    return callback(err,null);
                                }
                                return callback(null,result);
                            });
                        }
                    });
                }
                else
                {
                    return callback(null,null);
                }

            });
        },
        function (callback) {
            Cashclosure.findOne().sort('-dateTime').exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }

                //console.log(moment().diff(moment(result.dateTime),'days'));
                if(moment().diff(moment(result.dateTime))==0)
                {
                    exitState =1;
                    return callback(new Error("Today's day closure is completed, Please try tomorrow" ),null);
                }
                else
                {

                    var dt =moment(result.dateTime).add(1,'days');


                    var newDt = dt.format('YYYY-MM-DD');
                    var dur = moment().diff(moment(newDt),'days');

                    console.log(dur);
                    if(dur<=0)
                    {
                        exitState =1;
                        return callback(new Error("All cash closures are cleared" ),null);
                    }
                    /*var today = moment().format('YYYY-MM-DD');
                    var dur =   moment(today).diff(moment(newDt));
                    var d = moment.duration(dur).asDays();*/
                    cashDetails.dateinfo=newDt;
                    cashDetails.openingBalance=result.closingBalance;

                    return callback(null,result);
                }

            });
        },
        function (callback) {
            if(exitState==0)
            {
                depositInfo(cashDetails.dateinfo,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    cashDetails.bankdeposit = result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(exitState==0)
            {
                refundInfo(cashDetails.dateinfo,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    cashDetails.refunds = result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            if(exitState==0)
            {
                var data= {
                    fromdate:cashDetails.dateinfo,
                    todate:cashDetails.dateinfo,
                    location:'All'
                };
                totalcash(data,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    cashDetails.cashcollected = result[0].cash;
                    cashDetails.closingBalance = (cashDetails.openingBalance+cashDetails.cashcollected)-(cashDetails.bankdeposit+cashDetails.refunds);
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
        return callback(null,cashDetails);
    });
};

exports.getDepositsInfo = depositInfo;
function depositInfo(record,callback) {
    var amount=0;
    var ldate = moment(record.dateInfo).add(1, 'days');
    ldate=ldate.format('YYYY-MM-DD');
  async.series([
      function (callback) {
          Deposits.find({depositDate:{$gte:moment(record.dateInfo),$lt:moment(ldate)}},function (err,result) {
              if(err)
              {
                  return callback(err,null);
              }
              if(result)
              {
                  if(result.length>0)
                  {
                    for(var i=0;i<result.length;i++)
                    {
                        amount = amount+ result[i].amount;
                        if(i==result.length-1)
                        {
                            return callback(null,result);
                        }
                    }
                  }
                  else
                  {
                      return callback(null,result);
                  }
              }
              else
              {
                  return callback(null,result);
              }
          });
      }
  ],function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,amount);
  });
}

exports.getRefundInfo = refundInfo;
function refundInfo(record,callback) {
    var amount = 0;
    var ldate = moment(record.dateInfo).add(1, 'days');
    ldate=ldate.format('YYYY-MM-DD');
    async.series([
        function (callback) {
            Payments.find({createdAt:{$gte:moment(record.dateInfo),$lt:moment(ldate)},paymentDescription:'Refund'},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    if(result.length>0)
                    {
                        for(var i=0;i<result.length;i++)
                        {
                            amount = amount+result[i].debit;
                            if(i==result.length-1)
                            {
                                return callback(null,amount);
                            }
                        }
                    }
                    else
                    {
                        return callback(null,amount);
                    }
                }
                else
                {
                    return callback(null,0);
                }
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,amount);

    });

}

exports.ccavanueRequest = function (record,callback) {
    RequestHandler.postReq(record,function (res) {
        return callback(null,res);
    });
};