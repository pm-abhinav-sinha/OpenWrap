var config = require("./conf.js");
var CONSTANTS = require("./constants.js");
var util = require("./util.js");

var refThis = null;

refThis = this;

exports.getPublisherId = function(){
	return util.trim(config.pwt.pubid) || "0";
};

exports.getMataDataPattern = function(){
	if(util.isString(config[CONSTANTS.CONFIG.COMMON][CONSTANTS.CONFIG.META_DATA_PATTERN])){
		return config[CONSTANTS.CONFIG.COMMON][CONSTANTS.CONFIG.META_DATA_PATTERN];
	}
	return null;
};

exports.getSendAllBidsStatus = function(){
	return window.parseInt(config[CONSTANTS.CONFIG.COMMON][CONSTANTS.CONFIG.SEND_ALL_BIDS]) || 0;
};

exports.getTimeout = function(){
	var to=window.parseInt(config.pwt.t);
	var intelliReco=localStorage.getItem("intelliRecommendation");
	if(intelliReco!=undefined){
		intelliRecoObj=JSON.parse(intelliReco);
		
		if(intelliRecoObj!=undefined && intelliRecoObj.TIMEOUT!=undefined && intelliRecoObj.TIMEOUT[0]!=undefined){
			to+=window.parseInt(intelliRecoObj.TIMEOUT[0]);
		}
		
	}
	//return window.parseInt(config.pwt.t) || 1000;
	console.log("Timeout being used for this profile :"+to);
	return window.parseInt(to) || 1000;
};

exports.getAdapterRevShare = function(adapterID){
	var adapterConfig = config.adapters;
	if(util.isOwnProperty(adapterConfig[adapterID], CONSTANTS.CONFIG.REV_SHARE)){
		return (1 - window.parseFloat(adapterConfig[adapterID][CONSTANTS.CONFIG.REV_SHARE])/100);
	}
	return 1;
};

exports.getAdapterThrottle = function(adapterID){
	var adapterConfig = config.adapters;
	var throttle=window.parseFloat(adapterConfig[adapterID][CONSTANTS.CONFIG.THROTTLE]);

	var intelliReco=localStorage.getItem("intelliRecommendation");
	if(intelliReco!=undefined){
	intelliRecoObj=JSON.parse(intelliReco);
	console.log('Reading intelliRecommendation Data in Throttle function: '+intelliReco);
	
	if(intelliRecoObj!=undefined && intelliRecoObj.PARTNER_EXCLUDE!=undefined && intelliRecoObj.PARTNER_EXCLUDE.indexOf(adapterID)>-1){
		console.log("Setting Throttling for adapter: "+ adapterID + "to 90% as recommended by intelliRecoommendation engine.");
		throttle=10;
		}
	}
	if(util.isOwnProperty(adapterConfig[adapterID], CONSTANTS.CONFIG.THROTTLE)){
		return 100 - throttle;
	}
	return 0;
};

exports.isServerSideAdapter = function(adapterID){
	var adapterConfig = config.adapters;
	var ssEnabled=false;
	/* istanbul ignore else */
	if(util.isOwnProperty(adapterConfig[adapterID], CONSTANTS.CONFIG.SERVER_SIDE_ENABLED)){
		ssEnabled= window.parseInt(adapterConfig[adapterID][CONSTANTS.CONFIG.SERVER_SIDE_ENABLED]) === 1;
	}

	var intelliReco=localStorage.getItem("intelliRecommendation");
	if(intelliReco!=undefined){
	intelliRecoObj=JSON.parse(intelliReco);
	console.log('Reading intelliRecommendation Data in Throttle function: '+intelliReco);
	
	if(intelliRecoObj!=undefined && intelliRecoObj.PARTNER_SERVER!=undefined && intelliRecoObj.PARTNER_SERVER.indexOf(adapterID)>-1){
		console.log("Setting Server Side flag for adapter: "+ adapterID + "to true, as recommended by intelliRecoommendation engine.");
		ssEnabled=true;
		}
	}

	
	return ssEnabled;
};

exports.getAdapterMaskBidsStatus = function(adapterID){
	var adapterConfig = config.adapters;
	var tempSettings = {
		'audienceNetwork': 1,
		'rubicon': 1
	};

	if(util.isOwnProperty(tempSettings, adapterID)){
		return tempSettings[adapterID];
	}

	if(util.isOwnProperty(adapterConfig[adapterID], CONSTANTS.CONFIG.MASK_BIDS)){
		return window.parseInt(adapterConfig[adapterID][CONSTANTS.CONFIG.MASK_BIDS]) || 0;
	}
	return 0;
}

exports.getBidPassThroughStatus = function(adapterID){
	var adapterConfig = config.adapters;
	if(util.isOwnProperty(adapterConfig[adapterID], CONSTANTS.CONFIG.BID_PASS_THROUGH)){
		return window.parseInt(adapterConfig[adapterID][CONSTANTS.CONFIG.BID_PASS_THROUGH]);
	}
	return 0;
};

exports.getProfileID = function(){
	return util.trim(config.pwt[CONSTANTS.CONFIG.PROFILE_ID]) || "0";
};

exports.getProfileDisplayVersionID = function(){
	return util.trim(config.pwt[CONSTANTS.CONFIG.PROFILE_VERSION_ID]) || "0";
};

exports.getAnalyticsPixelURL = function(){
	return config.pwt[CONSTANTS.CONFIG.LOGGER_URL] || false;
};

exports.getMonetizationPixelURL = function(){
	return config.pwt[CONSTANTS.CONFIG.TRACKER_URL] || false;
};

exports.forEachAdapter = function(callback){
	util.forEachOnObject(config.adapters, callback);
};

function addPrebidAdapter(){
	var preBidAdapter = CONSTANTS.COMMON.PARENT_ADAPTER_PREBID;
	if(!util.isOwnProperty(config.adapters, preBidAdapter)){
		var adapterConfig = {};
		adapterConfig[CONSTANTS.CONFIG.REV_SHARE] = "0.0";
		adapterConfig[CONSTANTS.CONFIG.THROTTLE] = "100";
		adapterConfig[CONSTANTS.CONFIG.KEY_GENERATION_PATTERN]	= "_DIV_";
		adapterConfig[CONSTANTS.CONFIG.KEY_LOOKUP_MAP] = {};
		config.adapters[preBidAdapter] = adapterConfig;
	}
}

/* start-test-block */
exports.addPrebidAdapter = addPrebidAdapter;
/* end-test-block */

exports.initConfig = function(){
	refThis.addPrebidAdapter();

	var ignoreAdapterLevelParams = {};
	util.forEachOnObject(CONSTANTS.CONFIG, function(key, value){
		ignoreAdapterLevelParams[value] = "";
	});

	util.forEachOnObject(config.adapters, function(adapterID, adapterConfig){
		var adapterLevelParams = {};
		util.forEachOnObject(adapterConfig, function(key, value){
			if(!util.isOwnProperty(ignoreAdapterLevelParams, key)){
				adapterLevelParams[ key ] = value;
			}
		});
		util.forEachOnObject(adapterConfig[CONSTANTS.CONFIG.KEY_LOOKUP_MAP], function(kgpv, slotLevelParams){
			util.forEachOnObject(adapterLevelParams, function(key, value){
				slotLevelParams[ key ] = value;
			});
		});
	});
};
