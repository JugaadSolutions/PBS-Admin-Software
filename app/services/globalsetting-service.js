/**
 * Created by root on 16/1/17.
 */
var Station = require('../models/station'),
    Settings = require('../models/global-settings');

exports.createSetting = function (record,callback) {
    Settings.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateSetting = function (id,record,callback) {
  var settingData = {
      name:'',
      value:''
  };
  settingData.name=record.name;
    settingData.value=record.value;
    Settings.findOneAndUpdate({globalId:id},settingData,{new:true},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.globalInfo = function (callback) {
    var info = {
        DScount:0
    };
    Station.count({stationType:'dock-station'},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        info.DScount = result;
        return callback(null,info);
    });
};