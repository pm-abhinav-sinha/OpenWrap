exports.pwt = {
	t: "3000",
	pid: "0",
	gcv: "11",
	pdvid: "0",
	pubid: "301",
	dataURL: "t.pubmatic.com/logger?",
	winURL: "t.pubmatic.com/tracker?"
};

exports.adapters = {
	pubmatic: {
		rev_share: "0.0",
		throttle: "100",
		publisherId: "301",
		kgp: "_AU_@_W_x_H_:_AUI_",
		serverSideEnabled:"1"
	},
	appnexus: {
		rev_share: "0.0",
		throttle: "100",
		kgp: "_DIV_",
		klm: {
			"Div1": {
				placementId: "10433394"
			},
			"Div2": {
				placementId: "10433394"
			}
		}
	},
	pulsepoint: {
		cp: "521732",
		rev_share: "0.0",
		throttle: "100",
		kgp: "_DIV_",
		klm: {
			"Div1": {
				ct: "76835"
			},
			"Div2": {
				ct: "147007"
			}
		}
	},
	pubmaticServer: {
		rev_share: "0.0",
		throttle: "100",
		publisherId: "301",
		kgp: "_AU_@_W_x_H_:_AUI_"
	},
	intelliRecommendation: {
		rev_share: "0.0",
		throttle: "100",
		publisherId: "23105",
		profId: "100",
		kgp: "_AU_@_W_x_H_:_AUI_"
	}

};
