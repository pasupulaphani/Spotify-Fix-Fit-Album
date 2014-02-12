var Fiber = require('fibers');
var handleRequest = require('./handleRequest')

var getResp = function (url, callback) {
	Fiber(function () {
		var resp = handleRequest(url);
		callback(resp);
	}).run();
}

var getTracks = function (qry, callback) {
	getResp("http://ws.spotify.com/search/1/track.json?q="+qry, function(data) {
		var tracks = [];
		data.tracks.forEach(function(track) {
			tracks.push({name: track.name, length: track.length})
		})
		callback(tracks)
	})
}

var bestFit = function(qry, time, callback) {
	getTracks(qry, function(tracks) {
		function getCurrentFitTime() {
			var fit_time=0;
			best_fit_album.forEach(function (track) {
				fit_time = fit_time + track.length;
			})
			return fit_time
		}
		function canFit(track, t_diff) {
			for(var i = 0; i < best_fit_album.length; i++) {
				// console.log(track.length +" "+ best_fit_album[i].length+" " +t_diff)
				if(track.length > best_fit_album[i].length && (track.length - best_fit_album[i].length) < t_diff) {
					t = t + track.length;
					best_fit_album.splice(i,1);
					best_fit_album.push(track);
				}
			}
		}
		var t = 0;
		for(var i = 0; i < tracks.length; i++) {
			t = getCurrentFitTime() + tracks[i].length;
			// console.log(JSON.stringify(tracks[i]) + " " + t)
			best_fit_album.push(tracks[i]);
			if(t > time) {
				t = t - tracks[i].length;
				canFit(best_fit_album.pop(), time - t)
			}
		}
		callback()
	})
}

var best_fit_album = []
bestFit("bob dylan", 2000, function() {
	console.log(best_fit_album);
	var fit_time = 0;
	best_fit_album.forEach(function (track) {
		fit_time = fit_time + track.length;
	})
	console.log(fit_time)
})