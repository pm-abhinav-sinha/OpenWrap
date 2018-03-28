exports.pwt={
        t: "2000",
        pid: "3",
        gcv: "33",
        pdvid: "27",
        pubid: "5890",
        dataURL: "t.pubmatic.com/wl?",
        winURL: "t.pubmatic.com/wt?",
        //metaDataPattern: "_PC_:_BC_::_P_-_W_x_H_-_NE_(_GE_)||",
        sendAllBids: "0"
    };
    exports.adapters = {
        appnexus: {
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",
            pt: 0,
            kgp: "_W_x_H_@_W_x_H_",
            klm: {
                "300x250@300x250": {
                    placementId: "12110033"
                },
                "728x90@728x90": {
                    placementId: "12110035"
                }
        	}
        },
        pubmatic: {
            publisherId: "5890",
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",
            pt: 0,
            kgp: "_DIV_@_W_x_H_",
            sk: "true"
        },
         pubmaticServer: {
            publisherId: "5890",
            profileId: "3",
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",

            kgp: "_DIV_@_W_x_H_"
        },
         intelliRecommendation: {
            publisherId: "5890",
            kgp: "_DIV_@_W_x_H_",
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100"
        },
        districtm: {
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",
            kgp: "_W_x_H_@_W_x_H_",
            klm: {
                "300x250@300x250": {
                    placementId: "11907078"
                },
                "728x90@728x90": {
                    placementId: "11907080"
                }
            }
        },
        openx: {
            delDomain: "ask-d.openx.net",
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",
            pt: 0,
            kgp: "_W_x_H_@_W_x_H_",
            klm: {
                "300x250@300x250": {
                    unit: "539342498"
                },
                "728x90@728x90": {
                    unit: "539342500"
                }
            }
        },
        indexExchange: {
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",
            pt: 0,
            kgp: "_W_x_H_@_W_x_H_",
            klm: {
                "300x250@300x250": {
                    siteID: "220873",
                    id: "3"
                },
                "728x90@728x90": {
                    siteID: "220876",
                    id: "5"
                }
            }
        },
        criteo: {
            rev_share: "-15.0",
            timeout: "2000",
            throttle: "100",
            kgp: "_W_x_H_@_W_x_H_",
            klm: {
                "300x250@300x250": {
                    zoneId: "1089217"
                },
                "728x90@728x90": {
                    zoneId: "1089225"
                }
            }
        }
    };