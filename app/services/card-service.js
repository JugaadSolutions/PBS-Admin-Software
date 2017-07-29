var async = require('async');

var Card = require('../models/card'),
    Member = require('../models/member'),
    /*Employee = require('../models/employee'),*/
    Constants = require('../core/constants'),
    Station = require('../models/station'),
    User = require('../models/user'),
    CardTrack = require('../models/card-track'),
    Messages = require('../core/messages');

exports.createCard = function (record,callback) {
    
    var cardDetails;
    async.waterfall([
        function (callback) {
            if(record.createdBy)
            {
                User.findOne({UserID:record.createdBy},function (err,ud) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!ud)
                    {
                        return callback(new Error('Logged in user not found'),null);
                    }
                    record.createdBy = ud._id;
                    return callback(null,ud);
                });
            }
            else
            {
                return callback(null,cardDetails);
            }
        },
        function (cardDetails,callback) {
            Station.findOne({stationType:'Control-centre'},function (err,station) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!station)
                {
                    return callback(new Error('No controle centre found to add card'),null);
                }

                return callback(null,station);
            });
        },
        function (station,callback) {
            record.currentLocation = station._id;
            Card.create(record,function (err,result) {
                if(err)
                {
                    err.name = "UniqueFieldError";
                    err.message = record.cardNumber+':'+record.cardRFID;
                    return callback(err,null);
                }
                cardDetails = result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,cardDetails);
    });
};

exports.updateCard = function (id,record,callback) {

    var cardDetails;
    async.series([
        function (callback) {
            if(record.currentLocation)
            {
                if(isNaN(record.currentLocation))
                {
                        return callback(null,null);
                }
                else
                {
                    Station.findOne({StationID:record.currentLocation},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error('No station found for the given id'),null);
                        }
                        record.currentLocation = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        },

        function (callback) {
            if(isNaN(id))
            {
                Card.findById(id, function (err, result) {
                    if (err) {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error(Messages.NO_CARD_FOUND),null);
                    }
                    cardDetails = result;
                    return callback(null,result);
                });
            }
            else
            {
                Card.findOne({cardUid:id},function (err, result) {
                    if (err) {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error(Messages.NO_CARD_FOUND),null);
                    }
                    cardDetails = result;
                    id = result._id;
                    return callback(null,result);
                });
            }
        }
        ,
        function (callback) {
            if(isNaN(id))
            {
                Card.findByIdAndUpdate(id, record, {new: true}, function (err, result) {
                    if (err) {
                        return callback(err,null);
                    }
                    cardDetails = result;
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
        return callback(null,cardDetails);
    });

};

exports.deactivateCard = function (id, callback) {

    var memberObject;
    var assignedToId;
    var cardObject;
    var before;
    var IPs = [];
    var trackdata = {
        preStatus:0,
        postStatus:0,
        cardId:''
    };
    async.series([

            // Step 1: Method to validate card
            function (callback) {

                Card.findOne({'cardNumber':id}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_CARD_FOUND, null));
                    }
                    before = result.status;
                    cardObject=result;
                    return callback(null, result);

                });

            },
            function (callback) {
                Station.find({stationType:'dock-station'},function (err,result) {
                    if(err)
                    {
                        console.log('Error fetching station');
                    }
                    if(result.length>0)
                    {
                        for(var i=0;i<result.length;i++)
                        {
                            IPs.push(result[i].ipAddress);
                            if(i==result.length-1)
                            {
                                return callback(null,result);
                            }
                        }
                    }
                    else
                    {
                        return callback(null,null);
                    }
                });

            },

            // Step 1: Method to remove card from member
            function (callback) {

                User.findOne({'cardNum': id}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.USER_NOT_FOUND), null);
                    }

                    User.findByIdAndUpdate(result._id, {
                        $unset: {
                            cardNum:'',
                            smartCardId: '',
                            smartCardNumber: ''
                        }
                    }, {new: true}).lean().exec(function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }
                        if(!result)
                        {
                            return callback(new Error('Unable to remove card details from the user. Contact Admin'),null);
                        }
                        memberObject = result;
                        assignedToId = result._id;
                        return callback(null, result);
                    });
                });

            },
        function (callback) {
                if(memberObject) {
                    memberObject.lastModifiedAt = new Date();
                    memberObject.unsuccessIp = IPs;
                    memberObject.updateCount = 0;
                    memberObject.successIp = [];
                    User.findByIdAndUpdate(memberObject._id, memberObject, {new: true}).lean().exec(function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }
                        if (!result) {
                            return callback(new Error('Unable to update canceled details from the user. Contact Admin'));
                        }
                        memberObject = result;
                        return callback(null, result);
                    });
                }
                else
                {
                    return callback(null,null);
                }
        },

            // Step 3: Method to change card status to inactive
            function (callback) {

                if(cardObject && memberObject) {
                    Card.findByIdAndUpdate(cardObject._id, {
                        $unset: {
                            assignedTo: "",
                            issuedBy: "",
                            membershipId: "",
                            issuedDate: ""
                        }
                    }, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }
                        if(!result)
                        {
                            return callback(new Error('Unable to remove user details from Card'),null);
                        }
                        result.status = Constants.CardStatus.AVAILABLE;
                        result.balance = 0;
                        Card.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                            if (err) {
                                return callback(err, null);
                            }
                            cardObject = result;
                            trackdata.assignedUserId = memberObject._id;
                            trackdata.preStatus = before;
                            trackdata.postStatus = result.status;
                            trackdata.cardId = result._id;


                            CardTrack.create(trackdata, function (err, result) {
                                if (err) {
                                    return callback(err, null);
                                }
                                return callback(null, result);
                            });
                        });
                    });
                }
                else
                {
                    return callback(null,null);
                }
            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            if(cardObject)
            {
                return callback(err, cardObject);
            }
            else
            {
                return callback();
            }
        }
    );
};

exports.cardAvailableForMember = function (cardNumber, callback) {

    var cardObject;

    async.series([

            // Step 1: Method to verify card status
            function (callback) {

                Card.findOne({'cardNumber': cardNumber}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_CARD_FOUND, null));
                    }

                    if (result.length == 0) {
                        return callback(new Error(Messages.INVALID_CARD_NUMBER_PLEASE_TRY_AGAIN));
                    }

                    if (result.status == Constants.CardStatus.ASSIGNED) {
                        return callback(new Error(Messages.THIS_CARD_HAS_ALREADY_BEEN_ASSIGNED_TO_A_USER));
                    }

                    if (result.status == Constants.CardStatus.DAMAGED) {
                        return callback(new Error(Messages.THIS_CARD_HAS_BEEN_SET_AS_DAMAGED));
                    }

                    if (result.status == Constants.CardStatus.BLOCKED) {
                        return callback(new Error(Messages.THIS_CARD_HAS_BEEN_BLOCKED));
                    }

                    /*if (result.cardLevel != Card.CardLevel.CHECK_OUT_CARD) {
                        return callback(new Error(Messages.WRONG_CARD_TYPE_YOU_CANNOT_ASSIGN_THIS_CARD_TO_A_MEMBER));
                    }
*/
                    /*if (result.cardType != Card.CardType.REGISTERED_MEMBER) {
                        return callback(new Error(Messages.THIS_CARD_CANNOT_BE_ASSIGNED_TO_A_MEMBER));
                    }*/

                    cardObject = result;
                    return callback(null, result);

                });

            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, cardObject);

        }
    );

};

exports.reassignCard = function (record,callback) {
    var oldCardData;
    var newCardData;
    async.series([
        function (callback) {
            Card.findOne({cardNumber:record.oldCard},function (err,result) {
                if(err)
                {
                    return callback(err,null)
                }
                if(!result)
                {
                    return callback(new Error("Old card number not found"),null);
                }
                oldCardData = result;
                return callback(null,result);
            });
        },
        function (callback) {
            Card.findOne({cardNumber:record.newCard},function (err,result) {
                if(err)
                {
                    return callback(err,null)
                }
                if(!result)
                {
                    return callback(new Error("New card number not found"),null);
                }
                if(result.status!=Constants.CardStatus.AVAILABLE)
                {
                    return callback(new Error("Card is not available to re-assign, Please check the card number"),null);
                }
                result.assignedTo = oldCardData.assignedTo;
                result.issuedBy = oldCardData.issuedBy;
                result.balance = oldCardData.balance;
                result.membershipId = oldCardData.membershipId;
                result.status = oldCardData.status;
                result.cardType = oldCardData.cardType;
                result.currentLocation = oldCardData.currentLocation;
                result.issuedDate = oldCardData.issuedDate;
                result.createdBy = oldCardData.createdBy;
                Card.findByIdAndUpdate(result._id,result,{new:true},function (err,res) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    newCardData = res;
                    return callback(null,res);
                });
            });
        },
        function (callback) {
            User.findOneAndUpdate({cardNum:oldCardData.cardNumber},{$set:{cardNum:newCardData.cardNumber,smartCardNumber:newCardData.cardRFID,smartCardId:newCardData._id,lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            Card.findByIdAndRemove(oldCardData._id,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};