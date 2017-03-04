var async = require('async');

var Card = require('../models/card'),
    /*Member = require('../models/member'),
    Employee = require('../models/employee'),*/
    Constants = require('../core/constants'),
    Station = require('../models/station'),
    User = require('../models/user'),
    CardTrack = require('../models/card-track'),
    Messages = require('../core/messages');

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
                        return callback(null, null);
                    }

                    User.findByIdAndUpdate(result._id, {
                        $unset: {
                            cardNum:id,
                            smartCardId: result.smartCardId,
                            smartCardNumber: result.smartCardNumber
                        }
                    }, {new: true}).lean().exec(function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        memberObject = result;
                        assignedToId = result._id;
                        return callback(null, result);
                    });
                });

            },
        function (callback) {
                memberObject.lastModifiedAt = new Date();
            memberObject.unsuccessIp=IPs;
            memberObject.updateCount=0;
            memberObject.successIp=[];
            User.findByIdAndUpdate(memberObject._id, memberObject, {new: true}).lean().exec(function (err, result) {

                if (err) {
                    return callback(err, null);
                }

                memberObject = result;
                return callback(null, result);
            });

        },

            // Step 3: Method to change card status to inactive
            function (callback) {

                Card.findByIdAndUpdate(cardObject._id, {
                    $unset: {assignedTo: "",
                        issuedBy:"",
                        membershipId:memberObject.membershipId,
                         issuedDate: ""}
                }, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    result.status = Constants.CardStatus.AVAILABLE;
                    result.balance = 0;
                    Card.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        cardObject = result;
                                trackdata.assignedUserId=memberObject._id;
                                trackdata.preStatus=before;
                                trackdata.postStatus=result.status;
                                trackdata.cardId=result._id;


                        CardTrack.create(trackdata,function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            return callback(null,result);
                        });
                    });
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