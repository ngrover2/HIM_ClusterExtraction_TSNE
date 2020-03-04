requirejs(["d3.min"], function(d3) {
	//This function is called when scripts/d3.min.js is loaded.
	window.d4 = d3; // This is aliased this way as the code is written making use of both d3 versions (v3 and v4) and it uses d3.v4 as d3 and d3.v3 is aliased as d4
	window.d3 = null;
	console.log("d3 loaded");

	requirejs(["d3.v4.min"], function(v4) {
		//This function is called when scripts/d3.v4.min.js is loaded.
		
		window.d3 = v4; // This is aliased this way as the code is written making use of both d3 versions (v3 and v4) and it uses d3.v4 as d3 and d3.v3 is aliased as d4
		console.log("d3.v4 loaded");
		
		// Here we set window.scriptsLoaded to inform the checkScriptsReady function in him.js that required scripts have been loaded and the react app can be loaded
		window.scriptsLoaded = true;
		console.log("scripts loaded");
		// console.log("window.scriptsLoaded set");
	});
});