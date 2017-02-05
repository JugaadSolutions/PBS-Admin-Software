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
    lastSyncedAt:{type:Date,required:false,default:Date.now},
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
            IPs.push(result[i].StationID);
        }
        console.log(IPs.toString());
        /*        User.unsuccessIp=IPs;
         User.updateCount=0;
         User.successIp=[];*/
        var lastModifieddate = new Date();
        Vehicle.findOneAndUpdate({}, { $set: { unsyncedIp: IPs ,updateCount:0,syncedIp:[],lastModifiedAt:lastModifieddate} });
        next();
    });
    console.log('Update Vehicle ');
    //this.Name = 'TEST1234';
    next();
});

module.exports = Vehicle;


/*

// Third Party Dependencies
var mongoose = require('mongoose'),
extend = require('mongoose-schema-extend');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var uuid = require('node-uuid'),
    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract');
var Constants = require('../core/constants');

// Mongoose Schema
var Schema = mongoose.Schema;

var status = Constants.VehicleStatus;
var vtype = Constants.VehicleType;
var currentStatus = Constants.VehicleLocationStatus;

/!*
const AssociationIds = {
    AssociationId : {type:Schema.ObjectId,required:false,ref:'User'||'Port'}
    // noOfVehicle :{type:Number,required:false}
};
*!/

/!*
const Maintenance = {
    lastMaintainedDate: {type: Date, required: true},
    employeeId: {type: Schema.ObjectId, required: true, ref: 'Employee'}
};

const Repair = {
    lastRepairedDate: {type: Date, required: true},
    employeeId: {type: Schema.ObjectId, required: true, ref: 'Employee'}
};*!/


var schema = {
    fleetId:{type:Schema.ObjectId,required:true},
    vehicleNumber:{type:String,required:true,unique:true},//ref:'User'},
    vehicleRFID: {type: String, required: true,unique:true}, //ref: 'Bicycle'},
    vehicleType:{type:vtype,required:true, default:vtype.BICYCLE},
    vehicleStatus:{type:status,required:true,default:status.OPERATIONAL},
    vehicleCurrentStatus:{type:currentStatus,required:true,default:currentStatus.WITH_PORT},
    currentAssociationId:{type:Schema.ObjectId, required:false , ref:'user'||'port'}
    //maintenanceDetails: {type: [Maintenance], required: false},
    //repairDetails: {type: [Repair], required: false}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var Vehicle = mongoose.model('Vehicle', model, 'vehicle');

module.exports = Vehicle;
*/
