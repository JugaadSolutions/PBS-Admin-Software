/**
 * Created by root on 5/10/16.
 */
require('./index');
require('./user');
require('./port');
var mongoose = require('mongoose');
//bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    uuid = require('node-uuid'),
    DockStation = require('../models/dock-station'),
 autoIncrement = require('mongoose-auto-increment'),
    Port = require('../models/port'),
    Constants = require('../core/constants');

//Messages = require('../core/messages'),
//ValidationHandler = require('../handlers/validation-handler');
//var autoIncrement = require('mongoose-auto-increment');

var status = Constants.OperationStatus;
var vtype = Constants.VehicleType;
var currentStatus = Constants.VehicleLocationStatus;

/*const AssociationIds = {
    AssociationId : {type:Schema.ObjectId,required:false,ref:'user'||'port'}
    // noOfVehicle :{type:Number,required:false}
};*/

const maintain = {
    detailsId:{type:Schema.ObjectId, required:false, ref:'maintenance-details'}
};
const repair = {
    detailsId:{type:Schema.ObjectId, required:false}
};

var VehicleSchema = mongoose.Schema({
    fleetId:{type:Schema.ObjectId,required:true,ref:'Fleet'},
    vehicleUid: Number,
    vehicleNumber:{type:String,required:true,unique:true},//ref:'User'},
    vehicleRFID: {type: String, required: true,unique:true}, //ref: 'Bicycle'},
    vehicleType:{type:vtype,required:true, default:vtype.BICYCLE},
    vehicleStatus:{type:status,required:true,default:status.OPERATIONAL},
    vehicleCurrentStatus:{type:currentStatus,required:true,default:currentStatus.WITH_PORT},
    /*currentAssociationId:{type:[AssociationIds], required:false,default:[]}*/
    currentAssociationId:{type:Schema.ObjectId, required:false},
    updateCount:{type: Number, required: false,default:0},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastModifieddate:{type:Date,required:true,default:Date.now},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'},
    maintenance:{type:[maintain],required:false,default:[]},
    repairs:{type:[repair],required:false,default:[]},
    createdBy:{type:String,required:false},
    createdAt:{type:Date,required:true,default:Date.now}

}, { collection : 'vehicles'});


var Vehicle = mongoose.model('vehicle', VehicleSchema);

VehicleSchema.plugin(abstract);

VehicleSchema.plugin(autoIncrement.plugin,{model:Vehicle,field:'vehicleUid',startAt: 1, incrementBy: 1});

Vehicle.schema.pre('update',function (next) {
    var Vehicle = this;
    var IPs=[];
    /*    Syncronizer.updatesync(User,function (err,result) {
     if(err)
     {
     next();
     }
     console.log('User synced');
     next();
     });*/

    DockStation.find({'stationType':'dock-station'},function (err,result) {
        if(err)
        {
            console.error(err);
            next(err);
        }
        for(var i=0;i<result.length;i++)
        {
            IPs.push(result[i].ipAddress);
        }
        console.log(IPs.toString());
        /*        User.unsuccessIp=IPs;
         User.updateCount=0;
         User.successIp=[];*/
        var lastModifieddate = new Date();
        Vehicle.findOneAndUpdate({}, { $set: { unsyncedIp: IPs ,updateCount:0,syncedIp:[],lastModifieddate:lastModifieddate} });
        next();
    });
    console.log('Update Vehicle ');
    //this.Name = 'TEST1234';
    next();
});

Vehicle.schema.pre('save',function (next) {
    var Vehicle = this;
    var IPs=[];
    /*    Syncronizer.updatesync(User,function (err,result) {
     if(err)
     {
     next();
     }
     console.log('User synced');
     next();
     });*/

    DockStation.find({'stationType':'dock-station'},function (err,result) {
        if(err)
        {
            console.error(err);
            next(err);
        }
        for(var i=0;i<result.length;i++)
        {
            IPs.push(result[i].ipAddress);
        }
        console.log(IPs.toString());
        /*        User.unsuccessIp=IPs;
         User.updateCount=0;
         User.successIp=[];*/
        var lastModifieddate = new Date();
        Vehicle.lastModifieddate = lastModifieddate;
        Vehicle.unsyncedIp=IPs;
        Vehicle.updateCount = 0;
        Vehicle.syncedIp=[];
        /*Vehicle.findOneAndUpdate({}, { $set: { unsyncedIp: IPs ,updateCount:0,syncedIp:[],lastModifieddate:lastModifieddate} });*/
        next();
    });
    console.log('Update Vehicle');
    //next();
});

Vehicle.schema.post('save',function (doc) {
    var Vehicle = doc;
    var vehicleDetails={
        vehicleid:Vehicle._id,
        vehicleUid:Vehicle.vehicleUid
    };
    Port.findByIdAndUpdate(Vehicle.fleetId,{$push:{vehicleId:vehicleDetails}},function (err) {
        if(err)
        {
          return console.error('Error while updating fleet with new bicycle : '+err);
        }
    });

});

module.exports = Vehicle;