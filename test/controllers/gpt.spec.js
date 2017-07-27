/* global describe, it, xit, sinon, expect */
// var sinon = require("sinon");
var should = require("chai").should();
var expect = require("chai").expect;

var GPT = require("../../src_new/controllers/gpt.js");
var UTIL = require("../../src_new/util.js");
var AM = require("../../src_new/adapterManager.js");
var CONSTANTS = require("../../src_new/constants.js");
var CONFIG = require("../../src_new/config.js");
var BM = require("../../src_new/bidManager.js");

var commonDivID = "DIV_1";

// TODO : remove as required during single TDD only
// var jsdom = require('jsdom').jsdom;
// var exposedProperties = ['window', 'navigator', 'document'];
// global.document = jsdom('');
// global.window = document.defaultView;
// Object.keys(document.defaultView).forEach((property) => {
//     if (typeof global[property] === 'undefined') {
//         exposedProperties.push(property);
//         global[property] = document.defaultView[property];
//     }
// });
// global.navigator = {
//     userAgent: 'node.js'
// };

describe("CONTROLLER: GPT", function() {

    describe("#getAdUnitIndex()", function() {

        it("should return 0 when the object passed is null ", function() {
            GPT.getAdUnitIndex(null).should.equal(0);
        });

        it("should return 0 when the object passed is number ", function() {
            GPT.getAdUnitIndex(0).should.equal(0);
        });

        it("should return 0 when the object passed is empty string ", function() {
            GPT.getAdUnitIndex("").should.equal(0);
        });

        it("should return 0 when the object passed is not empty string ", function() {
            GPT.getAdUnitIndex("abcd").should.equal(0);
        });

        it("should return 0 when the object passed does not have required method ", function() {
            GPT.getAdUnitIndex({}).should.equal(0);
        });

        var random = Math.floor(Math.random() * 100);
        var test = {
            getSlotId: function() {
                return this;
            },
            getId: function() {
                return "abcd_" + random;
            }
        };

        it("should return " + random + " when the object passed does have required method ", function() {
            GPT.getAdUnitIndex(test).should.equal(random);
        });

    });

    describe("#callJsLoadedIfRequired()", function() {

        it("should return false when the object passed is string ", function() {
            GPT.callJsLoadedIfRequired("").should.equal(false);
        });

        it("should return false when the object passed is number ", function() {
            GPT.callJsLoadedIfRequired(1).should.equal(false);
        });

        it("should return false when the object passed is null ", function() {
            GPT.callJsLoadedIfRequired(null).should.equal(false);
        });

        it("should return false when the object is not passed ", function() {
            GPT.callJsLoadedIfRequired().should.equal(false);
        });

        it("should return false when the object passed is object but it does not have PWT property ", function() {
            GPT.callJsLoadedIfRequired({}).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set to null", function() {
            GPT.callJsLoadedIfRequired({ PWT: null }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set to string", function() {
            GPT.callJsLoadedIfRequired({ PWT: "" }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set to number", function() {
            GPT.callJsLoadedIfRequired({ PWT: 1 }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but does not have jsLoaded property", function() {
            GPT.callJsLoadedIfRequired({ PWT: {} }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but jsLoaded is set to null", function() {
            GPT.callJsLoadedIfRequired({ PWT: { jsLoaded: null } }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but jsLoaded is set to number", function() {
            GPT.callJsLoadedIfRequired({ PWT: { jsLoaded: 1 } }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but jsLoaded is set to string", function() {
            GPT.callJsLoadedIfRequired({ PWT: { jsLoaded: "" } }).should.equal(false);
        });

        var _test = {
            PWT: {}
        };
        _test.PWT.jsLoaded = function() {
            flag = true;
        };
        var flag = false;
        it("should return true when the object passed is object and PWT property is set and jsLoaded is set to function and the function is called", function() {
            GPT.callJsLoadedIfRequired(_test).should.equal(true);
            flag.should.equal(true);
        });

    });

    describe("#defineGPTVariables()", function() {
        it("should return false when the null is passed", function() {
            GPT.defineGPTVariables(null).should.equal(false);
        });

        var x = {};
        it("should return true when the object passed is valid", function() {
            GPT.defineGPTVariables(x).should.equal(true);
            UTIL.isObject(x.googletag);
            UTIL.isArray(x.googletag.cmd);
        });

        var x = {
            googletag: {
                cmd: [1, 2, 3]
            }
        };
        it("should return true when the googletag.cmd is already defined", function() {
            GPT.defineGPTVariables(x).should.equal(true);
            UTIL.isObject(x.googletag);
            UTIL.isArray(x.googletag.cmd);
            x.googletag.cmd.length.should.equal(3);
        });

        var winObj = {
            googletag: {

            }
        };
        it("should create googletag.cmd as empty array if not present", function(done) {
            GPT.defineGPTVariables(winObj).should.equal(true);
            UTIL.isArray(winObj.googletag.cmd);
            winObj.googletag.cmd.length.should.equal(0);
            done();
        });

        var winObj1 = {};
        it("should create googletag as empty object if not present", function(done) {
            GPT.defineGPTVariables(winObj1).should.equal(true);
            UTIL.isObject(winObj.googletag);
            done();
        });
    });

    describe("#setWindowReference()", function() {

        it("should not set WindowReference if argument is not object", function() {
            GPT.setWindowReference(0);
            expect(GPT.getWindowReference() === null).to.equal(true);
        });

        it("should set WindowReference if argument is object", function() {
            var x = { a: 0 };
            GPT.setWindowReference(x);
            var y = GPT.getWindowReference();
            expect(UTIL.isOwnProperty(y, "a") && y.a === x.a).to.equal(true);
        });
    });

    describe("#init()", function() {

        it("should return false when window object is null", function() {
            GPT.init(null).should.equal(false);
        });

        //todo: now we are calling a safeframe related function


        describe("When window object with required props are passed", function() {

            before(function(done) {
                sinon.stub(UTIL, "isObject",
                    function() {
                        return true;
                    });
                sinon.stub(GPT, "setWindowReference").returns(true);
                sinon.stub(GPT, "defineWrapperTargetingKeys").returns(true);
                sinon.stub(GPT, "defineGPTVariables").returns(true);
                sinon.stub(AM, "registerAdapters").returns(true);
                sinon.stub(GPT, "addHooksIfPossible").returns(true);
                sinon.stub(GPT, "callJsLoadedIfRequired").returns(true);
                sinon.stub(GPT, "initSafeFrameListener").returns(true);
                done();
            });

            after(function(done) {
                UTIL.isObject.restore();
                GPT.setWindowReference.restore();
                GPT.defineWrapperTargetingKeys.restore();
                GPT.defineGPTVariables.restore();
                AM.registerAdapters.restore();
                GPT.addHooksIfPossible.restore();
                GPT.callJsLoadedIfRequired.restore();
                done();
            });

            it("should return true when the required window object is passed", function() {
                GPT.init({}).should.equal(true);
            });

            //todo: now we are calling a safeframe related function
            it("should have called respective internal functions ", function(done) {

                GPT.init({
                    PWT: {
                        jsLoaded: function() {

                        }
                    }
                });

                // console.log("UTIL.isObject.calledOnce ==>", UTIL.isObject.callCount);

                UTIL.isObject.called.should.be.true;
                UTIL.isObject.returned(true);
                GPT.setWindowReference.called.should.be.true;
                GPT.defineWrapperTargetingKeys.called.should.be.true;
                GPT.defineGPTVariables.called.should.be.true;
                AM.registerAdapters.called.should.be.true;
                GPT.addHooksIfPossible.called.should.be.true;
                GPT.callJsLoadedIfRequired.called.should.be.true;
                done();
            });
        });
    });

    describe("#defineWrapperTargetingKeys()", function() {

        it("should return empty object when empty object is passed", function(done) {
            GPT.defineWrapperTargetingKeys({}).should.deep.equal({});
            done();
        });

        describe("When object with keys n values is passed", function() {
            beforeEach(function(done) {
                sinon.spy(UTIL, "forEachOnObject");
                done();
            });

            afterEach(function(done) {
                UTIL.forEachOnObject.restore();
                done();
            });

            var inputObject = {
                "key1": "value1",
                "key2": "value2"
            };

            var outputObject = {
                "value1": "",
                "value2": ""
            };

            it("should return object with values as keys and respective value should be empty strings", function(done) {
                GPT.defineWrapperTargetingKeys(inputObject).should.deep.equal(outputObject);
                done();
            });

            it("should have called util.forEachOnObject", function(done) {
                GPT.defineWrapperTargetingKeys(inputObject); //.should.deep.equal(outputObject);
                // console.log("UTIL.forEachOnObject.calledTwice ==>", UTIL.forEachOnObject.calledOnce);
                UTIL.forEachOnObject.calledOnce.should.equal(true);
                // expect(UTIL.forEachOnObject.calledTwice, true);
                done();
            });
        });
    });

    describe("#generateSlotName()", function() {
        var domId = null;
        var slotIDObject = null;
        var googleSlotObject = null;

        beforeEach(function(done) {
            sinon.spy(UTIL, "isFunction");
            domId = "DIV_1";
            slotIDObject = {
                getDomId: function() {
                    return domId;
                }
            };

            googleSlotObject = {
                getSlotId: function() {
                    return slotIDObject;
                }
            };

            done();
        });

        afterEach(function(done) {
            UTIL.isFunction.restore();
            domId = null;
            slotIDObject = null;
            googleSlotObject = null;
            done();
        });

        it("GPT.generateSlotName is a function", function(done) {
            GPT.generateSlotName.should.be.a("function");
            done();
        });

        it("return empty string if googleSlot is not an object", function(done) {
            GPT.generateSlotName(null).should.equal("");
            done();
        });

        it("return empty string if googleSlot is an object but without required methods", function(done) {
            GPT.generateSlotName({}).should.equal("");
            done();
        });

        it("should have called util.isFunction if propper googleSlot is passed", function(done) {
            GPT.generateSlotName(googleSlotObject);
            // console.log("UTIL.isFunction.called ==>", UTIL.isFunction.called);
            UTIL.isFunction.calledTwice.should.equal(true);
            done();
        });

        it("should have returned Dom Id as generated Slot name if propper googleSlot object is passed", function(done) {
            GPT.generateSlotName(googleSlotObject).should.equal(domId);
            done();
        });
    });

    describe("#defineWrapperTargetingKey()", function() {

        it("is a function", function(done) {
            GPT.defineWrapperTargetingKey.should.be.a("function");
            done();
        });

        it("set wrapper Targeting Key's value to empty string", function(done) {
            GPT.defineWrapperTargetingKey("DIV_1");
            // var x = GPT.wrapperTargetingKeys;
            // console.log("GPT.wrapperTargetingKeys ==>", GPT.wrapperTargetingKeys, x);
            GPT.wrapperTargetingKeys["DIV_1"].should.equal("");
            done();
        });


        it("initialize wrapperTargetingKeys if its not been initialized", function(done) {
            GPT.def;
            done();
        });
    });

    describe("#addHooksIfPossible()", function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "isUndefined");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isArray");
            sinon.spy(UTIL, "isFunction");
            sinon.spy(UTIL, "log");
            done();
        });

        afterEach(function(done) {
            UTIL.isUndefined.restore();
            UTIL.isObject.restore();
            UTIL.isArray.restore();
            UTIL.isFunction.restore();
            UTIL.log.restore();
            done();
        });

        it("is a function", function(done) {
            GPT.addHooksIfPossible.should.be.a("function");
            done();
        });

        it("return false if passed in window object is impropper and should have called util.log", function(done) {
            GPT.addHooksIfPossible({}).should.equal(false);
            UTIL.log.calledOnce.should.equal(true);
            UTIL.log.calledWith("Failed to load before GPT").should.be.true;

            UTIL.isUndefined.calledOnce.should.equal(true);
            UTIL.isObject.calledOnce.should.equal(true);
            // UTIL.isArray.calledOnce.should.equal(true);
            // UTIL.isFunction.calledOnce.should.equal(true);

            done();
        });

        var winObj = {
            googletag: {
                cmd: []
            }
        };
        it("return true if passed window object with required props and should have called util.log", function(done) {
            GPT.addHooksIfPossible(winObj).should.equal(true);
            UTIL.log.calledOnce.should.equal(true);
            UTIL.log.calledWith("Succeeded to load before GPT").should.be.true;
            done();
        });
    });


    describe("#addHooks()", function() {
        var winObj = null;
        var winObjBad = null;
        beforeEach(function(done) {
            winObj = {
                googletag: {
                    pubads: function() {
                        return {};
                    }
                }
            };

            winObjBad = {
                googletag: {
                    pubads: function() {
                        return null;
                    }
                }
            };

            sinon.spy(UTIL, "addHookOnFunction");
            sinon.spy(GPT, "addHookOnSlotDefineSizeMapping");
            sinon.spy(GPT, "newAddHookOnGoogletagDisplay");
            done();
        });

        afterEach(function(done) {
            winObj = null;
            winObjBad = null;
            UTIL.addHookOnFunction.restore();
            GPT.addHookOnSlotDefineSizeMapping.restore();
            GPT.newAddHookOnGoogletagDisplay.restore();
            done();
        });

        it("is a function", function(done) {
            GPT.addHooks.should.be.a("function");
            done();
        });

        it("returns false if passed in window object is not an object", function(done) {
            GPT.addHooks(null).should.equal(false);
            done();
        });

        it("returns false if googletag.pubads returns a non object value ", function(done) {
            GPT.addHooks(winObjBad).should.equal(false);
            done();
        });


        it("returns true if proper window object is passed with required structure", function(done) {
            GPT.addHooks(winObj).should.equal(true);
            done();
        });

        it("on passing proper window object with required structure should have called util.addHookOnFunction for various googletag pubads object methods", function(done) {
            GPT.addHooks(winObj).should.equal(true);

            GPT.addHookOnSlotDefineSizeMapping.calledOnce.should.equal(true);
            GPT.addHookOnSlotDefineSizeMapping.calledWith(winObj.googletag).should.equal(true);

            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "disableInitialLoad", GPT.newDisableInitialLoadFunction).should.equal(true);
            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "enableSingleRequest", GPT.newEnableSingleRequestFunction).should.equal(true);

            GPT.newAddHookOnGoogletagDisplay.calledOnce.should.equal(true);
            GPT.newAddHookOnGoogletagDisplay.calledWith(winObj.googletag).should.equal(true);

            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "refresh", GPT.newRefreshFuncton).should.equal(true);
            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "setTargeting", GPT.newSetTargetingFunction).should.equal(true);
            UTIL.addHookOnFunction.calledWith(winObj.googletag, false, "destroySlots", GPT.newDestroySlotsFunction).should.equal(true);

            done();
        });
    });

    describe("#addHookOnSlotDefineSizeMapping()", function() {


        var googleTag = null;
        var definedSlotS1 = null;
        beforeEach(function(done) {
            definedSlotS1 = {
                "/Harshad": {
                    sizes: [
                        [728, 90]
                    ],
                    id: "Harshad-02051986"
                }
            };
            googleTag = {
                defineSlot: function() {
                    return definedSlotS1;
                },
                destroySlots: function() {
                    return {};
                }
            };
            sinon.spy(googleTag, "defineSlot");
            sinon.spy(googleTag, "destroySlots");
            sinon.spy(UTIL, "isFunction");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "addHookOnFunction");
            done();
        });

        afterEach(function(done) {
            googleTag.defineSlot.restore();
            googleTag.destroySlots.restore();

            UTIL.isFunction.restore();
            UTIL.isObject.restore();
            UTIL.addHookOnFunction.restore();

            googleTag = null;

            done();
        });

        it("is a function", function(done) {
            GPT.addHookOnSlotDefineSizeMapping.should.be.a("function");
            done();
        });

        it("returns false if passed in googletag is not and object", function(done) {
            GPT.addHookOnSlotDefineSizeMapping(null).should.equal(false);
            done();
        });

        it("should return true when proper googleTag object is passed", function(done) {
            GPT.addHookOnSlotDefineSizeMapping(googleTag).should.equal(true);
            done();
        });

        it("on passing proper googleTag object should have called util.addHookOnFunction", function(done) {
            GPT.addHookOnSlotDefineSizeMapping(googleTag).should.equal(true);

            UTIL.addHookOnFunction.calledWith(definedSlotS1, true, "defineSizeMapping", GPT.newSizeMappingFunction).should.equal(true);

            googleTag.defineSlot.calledWith("/Harshad", [
                [728, 90]
            ], "Harshad-02051986").should.equal(true);

            googleTag.destroySlots.calledWith([definedSlotS1]).should.equal(true);

            done();
        });
    });

    describe('#getAdSlotSizesArray()', function() {
        var divID = null;
        var currentGoogleSlots = null;
        var sizeObj_1 = null;
        var sizeObj_2 = null;
        beforeEach(function(done) {
            divID = commonDivID;
            sizeObj_1 = {
                getWidth: function() {
                    return 1024;
                },
                getHeight: function() {
                    return 768;
                }
            };

            sizeObj_2 = {
                getWidth: function() {
                    return 640;
                },
                getHeight: function() {
                    return 480;
                }
            };
            currentGoogleSlots = {
                getSizes: function() {
                    return [sizeObj_1, sizeObj_2];
                }
            };

            sinon.spy(currentGoogleSlots, 'getSizes');
            sinon.spy(sizeObj_1, 'getHeight');
            sinon.spy(sizeObj_1, 'getWidth');
            sinon.spy(sizeObj_2, 'getHeight');
            sinon.spy(sizeObj_2, 'getWidth');

            sinon.stub(GPT, 'getSizeFromSizeMapping');
            GPT.getSizeFromSizeMapping.returns(true);
            sinon.stub(UTIL, 'log');
            sinon.stub(UTIL, 'isFunction');
            UTIL.isFunction.returns(true);
            sinon.spy(UTIL, 'forEachOnArray');
            done();
        });

        afterEach(function(done) {
            GPT.getSizeFromSizeMapping.restore();
            UTIL.log.restore();
            UTIL.isFunction.restore();
            UTIL.forEachOnArray.restore();

            currentGoogleSlots.getSizes.restore();
            sizeObj_1.getHeight.restore();
            sizeObj_1.getWidth.restore();
            sizeObj_2.getHeight.restore();
            sizeObj_2.getWidth.restore();

            sizeObj_1 = null;
            sizeObj_2 = null;
            currentGoogleSlots = null;
            done();
        });


        it('is a function', function(done) {
            GPT.getAdSlotSizesArray.should.be.a('function');
            done();
        });

        it('should have called getSizeFromSizeMapping', function(done) {
            GPT.getAdSlotSizesArray(divID, currentGoogleSlots).should.be.true;
            UTIL.log.calledWith(divID + ": responsiveSizeMapping applied: ");
            UTIL.log.calledWith(true);
            done();
        });

        it('should have created adSlotSizesArray when proper currentGoogleSlots is passed ', function(done) {
            GPT.getSizeFromSizeMapping.restore();
            sinon.stub(GPT, 'getSizeFromSizeMapping');
            GPT.getSizeFromSizeMapping.returns(false);
            GPT.getAdSlotSizesArray(divID, currentGoogleSlots).should.be.a('array');
            UTIL.isFunction.called.should.be.true;
            UTIL.forEachOnArray.called.should.be.true;

            currentGoogleSlots.getSizes.called.should.be.true;
            sizeObj_1.getHeight.called.should.be.true;
            sizeObj_1.getWidth.called.should.be.true;
            sizeObj_2.getHeight.called.should.be.true;
            sizeObj_2.getWidth.called.should.be.true;

            done();
        });
    });

    describe('#getSizeFromSizeMapping', function() {
        var divID = null;
        var slotSizeMapping = null;
        var screenWidth = 1024;
        var screenHeight = 768;
        beforeEach(function(done) {
            divID = commonDivID;
            slotSizeMapping = {};
            slotSizeMapping[divID] = [];
            sinon.spy(UTIL, 'isOwnProperty');

            sinon.stub(UTIL, 'getScreenWidth');
            UTIL.getScreenWidth.returns(screenWidth);

            sinon.stub(UTIL, 'getScreenHeight');
            UTIL.getScreenHeight.returns(screenHeight);

            sinon.stub(UTIL, 'isArray');
            sinon.stub(UTIL, 'isNumber');
            sinon.stub(UTIL, 'log');
            done();
        });

        afterEach(function(done) {
            divID = null;
            slotSizeMapping = null;
            UTIL.isOwnProperty.restore();
            UTIL.getScreenWidth.restore();
            UTIL.getScreenHeight.restore();
            UTIL.isArray.restore();
            UTIL.isNumber.restore();
            UTIL.log.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.getSizeFromSizeMapping.should.be.a('function');
            done();
        });

        it('should return false when given divID not a property of slotSizeMapping passed', function(done) {
            delete slotSizeMapping[divID];
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            UTIL.isOwnProperty.calledOnce.should.be.true;
            done();
        });

        it('should have logged sizeMapping and its details', function(done) {
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping);

            UTIL.log.calledWith(divID + ": responsiveSizeMapping found: screenWidth: " + screenWidth + ", screenHeight: " + screenHeight).should.be.true;
            UTIL.log.calledWith(slotSizeMapping[divID]).should.be.true;
            done();
        });

        it('should return false if sizeMapping is not and array', function(done) {
            slotSizeMapping[divID] = {};
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            UTIL.isArray.calledOnce.should.be.true;
            done();
        });


    });


    describe('#newDisplayFunction()', function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "log");
            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.newDisplayFunction.should.be.a('function');
            done();
        });

        it('should return null when impropper parameters are passed', function(done) {
            // TODO : finf better approach to check for null in chai
            var result = GPT.newDisplayFunction(null, function() { console.log("inside function") });
            // console.log(" result ==>", result);
            should.not.exist(result);
            UTIL.log.calledOnce.should.equal(true);
            UTIL.log.calledWith("display: originalFunction is not a function").should.be.true;
            done();
        });

        it('should return function when proper parameters are passed', function(done) {
            GPT.newDisplayFunction({}, function() { console.log("inside function") }).should.be.a('function');
            // console.log("updateSlotsMapFromGoogleSlots ==>", GPT.updateSlotsMapFromGoogleSlots.callCount);
            done();
        });

    });

    describe('#newSizeMappingFunction', function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");
            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();
            done();
        });


        it('is a function', function(done) {
            GPT.newSizeMappingFunction.should.be.a('function');
            done();
        });

        it('should return null when impropper parameters passed', function(done) {
            var result = GPT.newSizeMappingFunction(null, {});
            should.not.exist(result);
            UTIL.log.calledOnce.should.be.true;
            UTIL.log.calledWith("newSizeMappingFunction: originalFunction is not a function").should.be.true;
            done();
        });

        it('should return a function when propper parameters are passed', function(done) {
            GPT.newSizeMappingFunction({}, function() {
                console.log("inside function");
            }).should.be.a('function');
            UTIL.isObject.calledOnce.should.be.true;
            UTIL.isFunction.calledOnce.should.be.true;
            done();
        });
    });

    describe('#newRefreshFuncton', function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");
            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();
            done();
        });


        it('is a function', function(done) {
            GPT.newRefreshFuncton.should.be.a('function');
            done();
        });

        it('should return null when impropper parameters passed', function(done) {
            var result = GPT.newRefreshFuncton(null, {});
            should.not.exist(result);
            UTIL.log.calledOnce.should.be.true;
            UTIL.log.calledWith("refresh: originalFunction is not a function").should.be.true;
            done();
        });

        it('should return a function when propper parameters are passed', function(done) {
            GPT.newRefreshFuncton({}, function() {
                console.log("inside function");
            }).should.be.a('function');
            UTIL.isObject.calledOnce.should.be.true;
            UTIL.isFunction.calledOnce.should.be.true;
            done();
        });
    });

    describe('#getQualifyingSlotNamesForRefresh', function() {
        var arg = null;
        var theObject = null;

        beforeEach(function(done) {
            arg = [];
            theObject = {
                getSlots: function() {
                    return ["slot_1", "slot_2"];
                }
            };
            sinon.spy(UTIL, "forEachOnArray");
            sinon.stub(GPT, "generateSlotName");
            sinon.spy(theObject, "getSlots");
            GPT.generateSlotName.returns("qualifying_slot_name");
            done();
        });

        afterEach(function(done) {
            UTIL.forEachOnArray.restore();
            GPT.generateSlotName.restore();
            theObject.getSlots.restore();
            theObject = null;
            arg = null;
            done();
        });

        it('is a function', function(done) {
            GPT.getQualifyingSlotNamesForRefresh.should.be.a('function');
            done();
        });

        it('should return an array', function(done) {
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.a('array');
            done();
        });

        it('should have called GPT.generateSlotName and UTIL.forEachOnArray', function(done) {
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject);
            GPT.generateSlotName.called.should.be.true;
            UTIL.forEachOnArray.called.should.be.true;
            UTIL.forEachOnArray.calledWith(theObject.getSlots()).should.be.true;
            done();
        });

        it('should consider passed arg if its not empty instead of slots from the object being passed', function(done) {
            arg = [
                ["slot_1", "slot_2"]
            ];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject);
            UTIL.forEachOnArray.calledWith(arg[0]).should.be.true;
            done();
        });

        // TODO: input - output case is not considered
        // [['']]
        // need to add check for googletag.pubads().refresh(['']); // ignored in returned array
        // [[]]
        // need to add check for googletag.pubads().refresh(); // all slots will be refreshed
        // [null]
        // need to add check for googletag.pubads().refresh(null); // all slots will be refreshed

    });


    describe('#callOriginalRefeshFunction', function() {
        var flag = null;
        var theObject = null;
        var obj = null;
        // var originalFunction = null;
        var arg = null;

        beforeEach(function(done) {
            flag = true
            theObject = {}

            obj = {
                originalFunction: function(theObject, arg) {
                    return "originalFunction";
                }
            };
            // obj.originalFunction = originalFunction;
            sinon.spy(obj.originalFunction, 'apply');
            sinon.spy(UTIL, "log");
            arg = [
                ["slot_1", "slot_2"]
            ];
            done();
        });

        afterEach(function(done) {
            obj.originalFunction.apply.restore();
            UTIL.log.restore();
            flag = null;
            theObject = null;
            obj.originalFunction = null;
            obj = null;
            arg = null;
            done();
        });

        it('is a function', function(done) {
            GPT.callOriginalRefeshFunction.should.be.a('function');
            done();
        });

        it('should have logged if the ad has been already rendered ', function(done) {
            flag = false;
            GPT.callOriginalRefeshFunction(flag, theObject, obj.originalFunction, arg);
            UTIL.log.calledWith("AdSlot already rendered").should.be.true;
            done();
        });

        //todo: move the log messages to constants and use same here
        it('should have logged while calling the passed originalFunction with passed arguments', function(done) {
            GPT.callOriginalRefeshFunction(flag, theObject, obj.originalFunction, arg);
            obj.originalFunction.apply.calledWith(theObject, arg).should.be.true;
            UTIL.log.calledWith("Calling original refresh function post timeout").should.be.true;
            done();
        });
    });

    describe('#findWinningBidIfRequired_Refresh', function() {
        var slotName = null,
            divID = null,
            currentFlagValue = null;

        beforeEach(function(done) {
            slotName = "Slot_1";
            divID = commonDivID;
            currentFlagValue = true;
            GPT.slotMap = {};
            GPT.slotMap[slotName] = {
                isRefreshFunctionCalled: function() {
                    return true;
                },
                getStatus: function() {
                    return CONSTANTS.SLOT_STATUS.CREATED;
                }
            };

            sinon.stub(GPT.slotMap[slotName], "isRefreshFunctionCalled");

            sinon.stub(GPT.slotMap[slotName], "getStatus");

            sinon.stub(UTIL, "isOwnProperty");
            UTIL.isOwnProperty.returns(true);

            sinon.stub(GPT, "findWinningBidAndApplyTargeting");
            GPT.findWinningBidAndApplyTargeting.returns(true);

            sinon.stub(GPT, "updateStatusAfterRendering");
            GPT.updateStatusAfterRendering.returns(true);

            done();
        });

        afterEach(function(done) {


            GPT.slotMap[slotName].isRefreshFunctionCalled.restore();
            GPT.slotMap[slotName].getStatus.restore();

            GPT.slotMap[slotName] = null;


            UTIL.isOwnProperty.restore();

            GPT.findWinningBidAndApplyTargeting.restore();

            GPT.updateStatusAfterRendering.restore();

            slotName = null;
            divID = null;
            currentFlagValue = null;
            done();
        });

        it('is a function', function(done) {
            GPT.findWinningBidIfRequired_Refresh.should.be.a('function');
            done();
        });

        xit('should return true ', function(done) {
            GPT.findWinningBidIfRequired_Refresh(slotName, divID, currentFlagValue).should.be.true;
            GPT.slotMap[slotName].isRefreshFunctionCalled.called.should.be.true;
            GPT.slotMap[slotName].getStatus.called.should.be.true;
            UTIL.isOwnProperty.calledWith(GPT.slotsMap, slotName).should.be.true;
            done();
        });

        xit('should return passed currentFlagValue when either given slotName is not in slotMap or given slotNames refresh function is already not called or given slotNames status is of type DISPLAYED', function(done) {
            currentFlagValue = false;
            GPT.slotMap[slotName].isRefreshFunctionCalled.restore();
            sinon.stub(GPT.slotMap[slotName], "isRefreshFunctionCalled");
            GPT.slotMap[slotName].isRefreshFunctionCalled.returns(false);
            GPT.findWinningBidIfRequired_Refresh(slotName, divID, currentFlagValue).should.be.false;
            done();
        });
    });

    describe('#newAddHookOnGoogletagDisplay', function() {
        var localGoogletag = null;
        beforeEach(function(done) {
            localGoogletag = {};
            sinon.spy(UTIL, "log");
            sinon.stub(UTIL, "addHookOnFunction");
            UTIL.addHookOnFunction.returns(true);
            done();
        });

        afterEach(function(done) {
            localGoogletag = null;
            UTIL.log.restore();
            UTIL.addHookOnFunction.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.newAddHookOnGoogletagDisplay.should.be.a('function');
            done();
        });

        it('should have return without adding hook on localGoogletag passed', function(done) {
            GPT.displayHookIsAdded = true;
            GPT.newAddHookOnGoogletagDisplay(localGoogletag);
            UTIL.log.calledOnce.should.be.false;
            UTIL.addHookOnFunction.calledOnce.should.be.false;
            done();
        });

        it('should have return while adding hook on localGoogletag passed and logging it', function(done) {
            GPT.displayHookIsAdded = false;
            GPT.newAddHookOnGoogletagDisplay(localGoogletag);
            UTIL.log.calledWith("Adding hook on googletag.display.").should.be.true;
            UTIL.log.calledWith(localGoogletag, false, "display", GPT.newDisplayFunction).should.be.false;
            done();
        });


    });

    describe('#forQualifyingSlotNamesCallAdapters', function() {

        var qualifyingSlotNames = null,
            arg = null,
            isRefreshCall = null;
        var qualifyingSlots = null;
        beforeEach(function(done) {
            qualifyingSlotNames = ["slot_1", "slot_2", "slot_3"];
            arg = [
                ["slot_1"], "slot_2"
            ];
            qualifyingSlots = ["slot_1", "slot_2"];
            isRefreshCall = false;

            sinon.stub(GPT, "updateStatusOfQualifyingSlotsBeforeCallingAdapters");
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.returns(true);

            sinon.stub(GPT, "arrayOfSelectedSlots");
            GPT.arrayOfSelectedSlots.returns(qualifyingSlots);

            sinon.stub(AM, "callAdapters");
            AM.callAdapters.returns(true);

            done();
        });

        afterEach(function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.restore();
            GPT.arrayOfSelectedSlots.restore();
            AM.callAdapters.restore();

            qualifyingSlotNames = null;
            qualifyingSlots = null;

            done();
        });


        it('should be a function', function(done) {
            GPT.forQualifyingSlotNamesCallAdapters.should.be.a('function');
            done();
        });

        it('should have called updateStatusOfQualifyingSlotsBeforeCallingAdapters and arrayOfSelectedSlots', function(done) {
            GPT.forQualifyingSlotNamesCallAdapters(qualifyingSlotNames, arg, isRefreshCall);
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.calledWith(qualifyingSlotNames, arg, isRefreshCall).should.be.true;
            GPT.arrayOfSelectedSlots.calledWith(qualifyingSlotNames).should.be.true;
            AM.callAdapters.calledWith(qualifyingSlots).should.be.true;
            done();
        });

        it('should not have called updateStatusOfQualifyingSlotsBeforeCallingAdapters and arrayOfSelectedSlots when passed qualifyingSlotNames is empty', function(done) {
            qualifyingSlotNames = [];
            GPT.forQualifyingSlotNamesCallAdapters(qualifyingSlotNames, arg, isRefreshCall);
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.called.should.be.false;
            GPT.arrayOfSelectedSlots.called.should.be.false;
            AM.callAdapters.called.should.be.false;
            done();
        });
    });

    describe('#displayFunctionStatusHandler', function() {

        var oldStatus = null,
            theObject = null,
            originalFunction = null,
            arg = null;
        beforeEach(function(done) {
            oldStatus = CONSTANTS.SLOT_STATUS.CREATED;
            theObject = {};
            originalFunction = function() {
                return "originalFunction"
            };
            arg = {};
            sinon.spy(GPT, "updateStatusAndCallOriginalFunction_Display");
            done();
        });

        afterEach(function(done) {
            oldStatus = null;
            theObject = null;
            originalFunction = null;
            arg = null;
            GPT.updateStatusAndCallOriginalFunction_Display.restore();
            done();
        });

        it('should be a function', function(done) {
            GPT.displayFunctionStatusHandler.should.be.a('function');
            done();
        });

        it('should have called updateStatusAndCallOriginalFunction_Display with proper arguments when oldStatus is  TARGETING_ADDED', function(done) {
            oldStatus = CONSTANTS.SLOT_STATUS.TARGETING_ADDED;
            GPT.displayFunctionStatusHandler(oldStatus, theObject, originalFunction, arg);
            GPT.updateStatusAndCallOriginalFunction_Display
                .calledWith(
                    "As DM processing is already done, Calling original display function with arguments",
                    theObject,
                    originalFunction,
                    arg)
                .should.be.true;
            done();
        });

        it('should have called updateStatusAndCallOriginalFunction_Display with proper arguments when oldStatus is  DISPLAYED', function(done) {
            oldStatus = CONSTANTS.SLOT_STATUS.DISPLAYED;
            GPT.displayFunctionStatusHandler(oldStatus, theObject, originalFunction, arg);
            GPT.updateStatusAndCallOriginalFunction_Display
                .calledWith(
                    "As slot is already displayed, Calling original display function with arguments",
                    theObject,
                    originalFunction,
                    arg)
                .should.be.true;
            done();
        });
    });


    describe('#findWinningBidIfRequired_Display', function() {
        var key = null,
            slot = null;

        beforeEach(function(done) {
            key = "key_1";
            slot = {
                getStatus: function() {
                    return CONSTANTS.SLOT_STATUS.CREATED;
                }
            };
            sinon.stub(slot, "getStatus");

            sinon.stub(GPT, "findWinningBidAndApplyTargeting");
            GPT.findWinningBidAndApplyTargeting.returns(true);

            done();
        });

        afterEach(function(done) {
            GPT.findWinningBidAndApplyTargeting.restore();

            slot.getStatus.restore();

            key = null;
            slot = null;
            done();
        });

        it('is a function', function(done) {
            GPT.findWinningBidIfRequired_Display.should.be.a('function');
            done();
        });

        it('should not have called GPT.findWinningBidAndApplyTargeting if slot\'s status is either DISPLAYED or TARGETING_ADDED', function(done) {
            slot.getStatus.returns(CONSTANTS.SLOT_STATUS.DISPLAYED);
            GPT.findWinningBidIfRequired_Display(key, slot);
            GPT.findWinningBidAndApplyTargeting.called.should.be.false;
            slot.getStatus.called.should.be.true;
            done();
        });

        it('should have called GPT.findWinningBidAndApplyTargeting if slot\'s status is neither DISPLAYED nor TARGETING_ADDED', function(done) {
            GPT.findWinningBidIfRequired_Display(key, slot);
            GPT.findWinningBidAndApplyTargeting.called.should.be.true;
            slot.getStatus.called.should.be.true;
            done();
        });
    });

    describe('#updateStatusAndCallOriginalFunction_Display', function() {
        var message = null,
            theObject = null,
            originalFunction = null,
            arg = null;
        var obj = null;

        beforeEach(function(done) {
            message = "log message";
            theObject = {};
            obj = {
                originalFunction: function() {
                    return "originalFunction";
                }
            };

            arg = ["DIV_1", "DIV_2"];
            // sinon.spy(obj, "originalFunction");
            sinon.spy(obj.originalFunction, "apply");
            sinon.spy(UTIL, "log");

            sinon.stub(GPT, "updateStatusAfterRendering");
            GPT.updateStatusAfterRendering.returns(true);

            done();
        });

        afterEach(function(done) {
            obj.originalFunction.apply.restore();
            UTIL.log.restore();
            GPT.updateStatusAfterRendering.restore();
            message = null;
            theObject = null;
            originalFunction = null;
            arg = null;
            done();
        });

        it('is a function', function(done) {
            GPT.updateStatusAndCallOriginalFunction_Display.should.be.a('function');
            done();
        });

        it('should have called UTIL.log, GPT.updateStatusAfterRendering and passed originalFunction with proper arguments', function(done) {
            GPT.updateStatusAndCallOriginalFunction_Display(message, theObject, obj.originalFunction, arg);
            UTIL.log.calledWith(message).should.be.true;
            UTIL.log.calledWith(arg).should.be.true;
            obj.originalFunction.apply.calledWith(theObject, arg).should.be.true;
            GPT.updateStatusAfterRendering.calledWith(arg[0], false).should.be.true;
            done();
        });
    });

    describe('#newDestroySlotsFunction', function() {
        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newDestroySlotsFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newDestroySlotsFunction(theObject, originalFunction));
            UTIL.log.calledWith("destroySlots: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newDestroySlotsFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });

    describe('#newSetTargetingFunction', function() {

        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newSetTargetingFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newSetTargetingFunction(theObject, originalFunction));
            UTIL.log.calledWith("setTargeting: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newSetTargetingFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });


    describe('#newEnableSingleRequestFunction', function() {

        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newEnableSingleRequestFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newEnableSingleRequestFunction(theObject, originalFunction));
            UTIL.log.calledWith("disableInitialLoad: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newEnableSingleRequestFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });


    describe('#newDisableInitialLoadFunction', function() {

        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newDisableInitialLoadFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newDisableInitialLoadFunction(theObject, originalFunction));
            UTIL.log.calledWith("disableInitialLoad: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newDisableInitialLoadFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });

    describe('#arrayOfSelectedSlots', function() {
        var slotNames = null;
        beforeEach(function(done) {
            slotNames = ["slot_1", "slot_2", "slot_3"];
            GPT.slotsMap = {
                "slot_1": {
                    getStatus: function() {
                        return "slot_1";
                    }
                },
                "slot_2": {
                    getStatus: function() {
                        return "slot_2";
                    }
                },
                "slot_3": {
                    getStatus: function() {
                        return "slot_3";
                    }
                },
            };
            sinon.spy(UTIL, "forEachOnArray");
            done();
        });

        afterEach(function(done) {
            UTIL.forEachOnArray.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.arrayOfSelectedSlots.should.be.a('function');
            done();
        });

        it('return array slot objects of given slot names from the slotMap', function(done) {
            GPT.arrayOfSelectedSlots(slotNames).should.be.a('array');
            done();
        });
    });

    describe('#setDisplayFunctionCalledIfRequired', function() {

        var slot = null,
            arg = null;
        beforeEach(function(done) {
            slot = {
                getDivID: function() {
                    return "DIV_1";
                },
                setDisplayFunctionCalled: function() {
                    return true;
                },
                setArguments: function() {
                    return true;
                }
            };
            arg = ["DIV_1", "DIV_2"];

            sinon.spy(slot, "getDivID");
            sinon.spy(slot, "setDisplayFunctionCalled");
            sinon.spy(slot, "setArguments");

            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");
            sinon.spy(UTIL, "isArray");
            done();
        });

        afterEach(function(done) {

            slot.getDivID.restore();
            slot.setDisplayFunctionCalled.restore();
            slot.setArguments.restore();

            slot = null;

            UTIL.isObject.restore();
            UTIL.isFunction.restore();
            UTIL.isArray.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.setDisplayFunctionCalledIfRequired.should.be.a('function');
            done();
        });

        it('should have called setDisplayFunctionCalled and setArguments if given is proper ', function(done) {
            GPT.setDisplayFunctionCalledIfRequired(slot, arg);
            UTIL.isObject.calledWith(slot).should.be.true;
            UTIL.isFunction.calledWith(slot.getDivID).should.be.true;
            UTIL.isArray.calledWith(arg).should.be.true;
            slot.getDivID.called.should.be.true;
            slot.setDisplayFunctionCalled.calledWith(true).should.be.true;
            slot.setArguments.calledWith(arg).should.be.true;
            done();
        });

    });

    describe('#getStatusOfSlotForDivId', function() {
        var divID = null;

        beforeEach(function(done) {
            divID = commonDivID;
            GPT.slotsMap[divID] = {
                getStatus: function() {
                    CONSTANTS.SLOT_STATUS.TARGETING_ADDED;
                }
            };
            sinon.spy(GPT.slotsMap[divID], "getStatus");
            sinon.stub(UTIL, "isOwnProperty");

            UTIL.isOwnProperty.returns(true)
            done();
        });

        afterEach(function(done) {
            GPT.slotMap[divID] = null;
            UTIL.isOwnProperty.restore();
            divID = null;
            done();
        });

        it('is a function', function(done) {
            GPT.getStatusOfSlotForDivId.should.be.a('function');
            done();
        });

        it('should return slot status by calling getStatus of the given slot if its present in slotMap', function(done) {
            GPT.getStatusOfSlotForDivId(divID);
            // UTIL.isOwnProperty.calledWith(GPT.slotMap, divID).should.be.true;
            UTIL.isOwnProperty.called.should.be.true;
            GPT.slotsMap[divID].getStatus.called.should.be.true;
            done();
        });

        it('should return slot status as DISPLAYED if given divID is not present in slotMap', function(done) {
            UTIL.isOwnProperty.returns(false);
            GPT.getStatusOfSlotForDivId(divID).should.be.equal(CONSTANTS.SLOT_STATUS.DISPLAYED);
            done();
        });
    });

    describe('#getSlotNamesByStatus', function() {
        var divID = null;
        var statusObject = null;

        beforeEach(function(done) {

            divID = commonDivID;
            statusObject = CONSTANTS.SLOT_STATUS.TARGETING_ADDED;

            GPT.slotsMap[divID] = {
                getStatus: function() {
                    CONSTANTS.SLOT_STATUS.TARGETING_ADDED;
                }
            };
            sinon.spy(GPT.slotsMap[divID], "getStatus");
            sinon.spy(UTIL, 'forEachOnObject');
            // UTIL.forEachOnObject.returns(true);
            sinon.stub(UTIL, 'isOwnProperty');
            UTIL.isOwnProperty.returns(true);
            done();
        });

        afterEach(function(done) {
            GPT.slotMap[divID] = null;
            UTIL.forEachOnObject.restore();
            UTIL.isOwnProperty.restore();
            divID = null;
            done();
        });

        it('is a function', function(done) {
            GPT.getSlotNamesByStatus.should.be.a('function');
            done();
        });

        it('should return array of slots', function(done) {
            GPT.getSlotNamesByStatus(statusObject).should.be.a('array');
            done();
        });

        it('should have called UTIL functions and slot\'s getStatus', function(done) {
            GPT.getSlotNamesByStatus(statusObject);
            UTIL.isOwnProperty.called.should.be.true;
            UTIL.forEachOnObject.called.should.be.true;
            GPT.slotsMap[divID].getStatus.called.should.be.true;
            done();
        });
    });

    describe('#removeDMTargetingFromSlot', function() {
        var key = null;
        var currentGoogleSlot = null;
        beforeEach(function(done) {
            key = commonDivID;
            GPT.slotsMap = {};
            currentGoogleSlot = {
                getTargetingKeys: function() {
                    return "getTargetingKeys";
                },
                getTargeting: function() {
                    return "getTargeting";
                },
                clearTargeting: function() {
                    return "clearTargeting";
                },
                setTargeting: function() {
                    return "setTargeting";
                },
            };
            GPT.slotsMap[key] = {
                getPubAdServerObject: function() {
                    return currentGoogleSlot;
                }
            };

            sinon.stub(currentGoogleSlot, "getTargetingKeys");
            currentGoogleSlot.getTargetingKeys.returns(["slot_1", "slot_2"]);
            sinon.stub(currentGoogleSlot, "getTargeting");
            sinon.stub(currentGoogleSlot, "clearTargeting");
            sinon.stub(currentGoogleSlot, "setTargeting");

            sinon.stub(UTIL, "isOwnProperty");
            UTIL.isOwnProperty.returns(true);

            sinon.spy(UTIL, "forEachOnArray");
            sinon.spy(UTIL, "forEachOnObject");
            done();
        });


        afterEach(function(done) {
            currentGoogleSlot.getTargetingKeys.restore();
            currentGoogleSlot.getTargeting.restore();
            currentGoogleSlot.clearTargeting.restore();
            currentGoogleSlot.setTargeting.restore();

            UTIL.isOwnProperty.restore();
            UTIL.forEachOnArray.restore();
            UTIL.forEachOnObject.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.removeDMTargetingFromSlot.should.be.a('function');
            done();
        });

        it('should have called proper functions', function(done) {
            GPT.removeDMTargetingFromSlot(key);
            UTIL.isOwnProperty.called.should.be.true;
            UTIL.forEachOnObject.called.should.be.true;
            UTIL.forEachOnArray.called.should.be.true;

            currentGoogleSlot.getTargetingKeys.called.should.be.true;
            currentGoogleSlot.getTargeting.called.should.be.true;
            currentGoogleSlot.clearTargeting.called.should.be.true;
            currentGoogleSlot.setTargeting.called.should.be.true;
            done();
        });
    });

    describe('#updateStatusOfQualifyingSlotsBeforeCallingAdapters', function() {
        var slotNames = null,
            argumentsFromCallingFunction = null,
            isRefreshCall = null;
        var slotObject = null;
        beforeEach(function(done) {
            slotNames = ["slot_1", "slot_2", "slot_3"];
            argumentsFromCallingFunction = {};
            isRefreshCall = true;
            sinon.spy(UTIL, "forEachOnArray");
            sinon.stub(UTIL, "isOwnProperty");
            GPT.slotsMap = {};
            slotObject = {
                setStatus: function() {
                    return "setStatus";
                },
                setRefreshFunctionCalled: function() {
                    return "setRefreshFunctionCalled";
                },
                setArguments: function() {
                    return "setArguments";
                },
                getStatus: function() {
                    return CONSTANTS.SLOT_STATUS.PARTNERS_CALLED;
                }
            };

            sinon.spy(slotObject, "setStatus");
            sinon.spy(slotObject, "setRefreshFunctionCalled");
            sinon.spy(slotObject, "setArguments");

            GPT.slotsMap["slot_1"] = slotObject;
            GPT.slotsMap["slot_2"] = slotObject;
            GPT.slotsMap["slot_3"] = slotObject;

            UTIL.isOwnProperty.returns(true);
            sinon.stub(GPT, "removeDMTargetingFromSlot");
            GPT.removeDMTargetingFromSlot.returns(true);

            done();
        });

        afterEach(function(done) {

            slotObject.setStatus.restore();
            slotObject.setRefreshFunctionCalled.restore();
            slotObject.setArguments.restore();

            GPT.slotsMap = null;

            UTIL.forEachOnArray.restore();
            UTIL.isOwnProperty.restore();

            GPT.removeDMTargetingFromSlot.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.should.be.a('function');
            done();
        });

        it('should set status of slot to PARTNERS_CALLED if given slot is present in slotsMap', function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters(slotNames, argumentsFromCallingFunction, isRefreshCall);
            UTIL.forEachOnArray.calledWith(slotNames).should.be.true;
            GPT.slotsMap["slot_1"].getStatus().should.be.equal(CONSTANTS.SLOT_STATUS.PARTNERS_CALLED);
            done();
        });

        it('should have called GPT.removeDMTargetingFromSlot with slot names and should have called respective slot\'s setRefreshFunctionCalled and setArguments if isRefreshCall is true', function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters(slotNames, argumentsFromCallingFunction, isRefreshCall);
            GPT.removeDMTargetingFromSlot.called.should.be.true;
            GPT.slotsMap["slot_1"].setRefreshFunctionCalled.calledWith(true).should.be.true;
            GPT.slotsMap["slot_1"].setArguments.calledWith(argumentsFromCallingFunction).should.be.true;
            done();
        });
    });

    describe('#postTimeoutRefreshExecution', function() {
        var qualifyingSlotNames = null,
            theObject = null,
            originalFunction = null,
            arg = null;
        var slotObject = null;
        beforeEach(function(done) {
            qualifyingSlotNames = ["slot_1", "slot_2"];
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };
            arg = {};
            slotObject = {
                getDivID: function() {
                    return "getDivID";
                },
                getSizes: function() {
                    return "getSizes";
                },
            };

            GPT.slotsMap = {};
            GPT.slotsMap["slot_1"] = slotObject;
            GPT.slotsMap["slot_2"] = slotObject;

            sinon.spy(slotObject, "getDivID");

            sinon.spy(window, "setTimeout");

            sinon.spy(CONFIG, "getTimeout");

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "forEachOnArray");
            sinon.spy(UTIL, "createVLogInfoPanel");
            sinon.spy(UTIL, "realignVLogInfoPanel");

            sinon.stub(BM, "executeAnalyticsPixel");
            BM.executeAnalyticsPixel.returns(true);
            sinon.stub(GPT, "callOriginalRefeshFunction");
            GPT.callOriginalRefeshFunction.returns(true);

            sinon.stub(GPT, "findWinningBidIfRequired_Refresh");
            GPT.findWinningBidIfRequired_Refresh.returns(true);

            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            UTIL.forEachOnArray.restore();
            UTIL.createVLogInfoPanel.restore();
            UTIL.realignVLogInfoPanel.restore();

            BM.executeAnalyticsPixel.restore();

            GPT.callOriginalRefeshFunction.restore();

            GPT.findWinningBidIfRequired_Refresh.restore();

            window.setTimeout.restore();

            CONFIG.getTimeout.restore();

            slotObject.getDivID.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.postTimeoutRefreshExecution.should.be.a('function');
            done();
        });

        // todo
        xit('should have logged the arg', function(done) {
            GPT.postTimeoutRefreshExecution(qualifyingSlotNames, theObject, originalFunction, arg);
            UTIL.log.calledWith("Executing post CONFIG.getTimeout() events, arguments: ").should.be.true;
            UTIL.log.calledWith(arg).should.be.true;
            UTIL.forEachOnArray.calledWith(qualifyingSlotNames).should.be.true;
            window.setTimeout.called.should.be.true;
            BM.executeAnalyticsPixel.called.should.be.true;
            GPT.callOriginalRefeshFunction.calledWith(true, theObject, originalFunction, arg).should.be.true;
            done();
        });
    });

    describe('#getSizeFromSizeMapping', function() {
        var divID = null,
            slotSizeMapping = null;
        var sizeMapping = null;

        beforeEach(function(done) {
            divID = commonDivID;
            sizeMapping = [
                [340, 210],
                [1024, 768]
            ]
            slotSizeMapping = sizeMapping;
            sinon.stub(UTIL, "isOwnProperty");
            sinon.stub(UTIL, "getScreenWidth");
            sinon.stub(UTIL, "getScreenHeight");
            sinon.stub(UTIL, "isArray");
            sinon.stub(UTIL, "isNumber");
            sinon.stub(UTIL, "log");

            sinon.stub(GPT, "getWindowReference");
            GPT.getWindowReference.returns(true);
            done();
        });

        afterEach(function(done) {

            UTIL.isOwnProperty.restore();
            UTIL.getScreenWidth.restore();
            UTIL.getScreenHeight.restore();
            UTIL.isArray.restore();
            UTIL.isNumber.restore();
            UTIL.log.restore();

            GPT.getWindowReference.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.getSizeFromSizeMapping.should.be.a('function');
            done();
        });

        it('returns false if given divID is not in give slotSizeMapping', function(done) {
            UTIL.isOwnProperty.returns(false);
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            done();
        });

        it('returns false if sizeMapping for given divID is not an array', function(done) {
            UTIL.isOwnProperty.returns(true);
            UTIL.isArray.withArgs(sizeMapping).returns(false);
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            done();
        });
    });

    describe('#storeInSlotsMap', function() {
        it('is a function', function(done) {
            GPT.storeInSlotsMap.should.be.a('function');
            done();
        });
    });


    describe('#updateSlotsMapFromGoogleSlots', function() {
        it('is a function', function(done) {
            GPT.updateSlotsMapFromGoogleSlots.should.be.a('function');
            done();
        });
    });

    describe('#updateStatusAfterRendering', function() {
        it('is a function', function(done) {
            GPT.updateStatusAfterRendering.should.be.a('function');
            done();
        });
    });

    describe('#findWinningBidAndApplyTargeting', function() {
        var divID = null;
        var dataStub = null;
        var winningBidStub = null;
        var keyValuePairsStub = null;
        var googleDefinedSlotStub = null;

        beforeEach(function(done) {
            divID = commonDivID;
            winningBidStub = {
                getBidID: function() {
                    return "getBidID";
                },
                getStatus: function() {
                    return "getStatus";
                },
                getNetEcpm: function() {
                    return "getNetEcpm";
                },
                getDealID: function() {
                    return "getDealID";
                },
                getAdapterID: function() {
                    return "getAdapterID";
                },
            };
            sinon.stub(winningBidStub, "getBidID");
            sinon.stub(winningBidStub, "getStatus");
            sinon.stub(winningBidStub, "getNetEcpm");
            sinon.stub(winningBidStub, "getDealID");
            sinon.stub(winningBidStub, "getAdapterID");
            keyValuePairsStub = {
                "key1": {
                    "k1": "v1",
                    "k2": "v2"
                },
                "key2": {
                    "k12": "v12",
                    "k22": "v22"
                }
            };
            dataStub = {
                wb: winningBidStub,
                kvp: keyValuePairsStub
            };
            googleDefinedSlotStub = {
                setTargeting: function() {
                    return "setTargeting";
                }
            };
            sinon.spy(googleDefinedSlotStub, "setTargeting");

            GPT.slotsMap[divID] = {
                getPubAdServerObject: function() {
                    return googleDefinedSlotStub;
                },
                setStatus: function() {
                    return "setStatus";
                }
            };
            sinon.spy(GPT.slotsMap[divID], "setStatus");

            sinon.stub(BM, "getBid").withArgs(divID).returns(dataStub);
            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "forEachOnObject");
            sinon.stub(UTIL, "isOwnProperty");
            sinon.stub(GPT, "defineWrapperTargetingKey").returns(true);
            done();
        });

        afterEach(function(done) {
            BM.getBid.restore();

            UTIL.log.restore();
            UTIL.forEachOnObject.restore();
            UTIL.isOwnProperty.restore();

            GPT.slotsMap[divID].setStatus.restore();

            googleDefinedSlotStub.setTargeting.restore();
            GPT.defineWrapperTargetingKey.restore();

            if (winningBidStub) {
                winningBidStub.getBidID.restore();
                winningBidStub.getStatus.restore();
                winningBidStub.getNetEcpm.restore();
                winningBidStub.getDealID.restore();
                winningBidStub.getAdapterID.restore();
            }
            divID = null;
            done();
        });

        it('is a function', function(done) {
            GPT.findWinningBidAndApplyTargeting.should.be.a('function');
            done();
        });

        it('should have logged passed divID along with winning Bid object', function(done) {
            GPT.findWinningBidAndApplyTargeting(divID);
            UTIL.log.calledWith("DIV: " + divID + " winningBid: ").should.be.true;
            UTIL.log.calledWith(winningBidStub).should.be.true;
            done();
        });

        it('should not have called setTargeting for bid if the winningBid is invalid object', function(done) {
            winningBidStub = null;
            GPT.findWinningBidAndApplyTargeting(divID);
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.SLOT_STATUS.TARGETING_ADDED).should.be.false;
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.WRAPPER_TARGETING_KEYS.PROFILE_ID, CONFIG.getProfileID()).should.be.false;
            done();
        });

        it('should not have called setTargeting for bid if bid\'s net ecpm is not greater than 0', function(done) {
            winningBidStub.getNetEcpm.returns(-1);
            GPT.findWinningBidAndApplyTargeting(divID);
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.SLOT_STATUS.TARGETING_ADDED).should.be.false;
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.WRAPPER_TARGETING_KEYS.PROFILE_ID, CONFIG.getProfileID()).should.be.false;
            winningBidStub.getNetEcpm.called.should.be.true;
            winningBidStub.getBidID.called.should.be.false;
            winningBidStub.getStatus.called.should.be.false;
            winningBidStub.getDealID.called.should.be.false;
            winningBidStub.getAdapterID.called.should.be.false;
            done();
        });

        it('should not have called defineWrapperTargetingKey if key in keyValuePairs is among prebid keys to ignore', function(done) {
            winningBidStub.getNetEcpm.returns(2);

            UTIL.isOwnProperty.withArgs(CONSTANTS.IGNORE_PREBID_KEYS).returns(true);

            GPT.findWinningBidAndApplyTargeting(divID);

            winningBidStub.getNetEcpm.called.should.be.true;
            winningBidStub.getBidID.called.should.be.true;
            winningBidStub.getStatus.called.should.be.true;
            GPT.defineWrapperTargetingKey.called.should.be.false;
            done();
        });
    });
});
