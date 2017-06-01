var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('./config');

const apiBaseUrl = 'http://api.themoviedb.org/3'; 
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+ config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';
/* GET home page. */
router.get('/', function(req, res, next) {

	request.get(nowPlayingUrl,(error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movie_list', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Movie Database - Now Playing"
		});

	});
	
  	

});

// router.get('/search', (req, res)=>{
// 	res.send('The get search page');
// });

router.post('/search', (req, res)=>{
	// req.body is available bc of the body-parser module that was created with expressApp.
	// console.log(req.body);
	var termUserSearchedFor = req.body.searchString;
	var searchUrl = apiBaseUrl + '/search/movie?query='+termUserSearchedFor+'&api_key='+config.apiKey;
	// request.get(nowPlayingUrl,(error,response,movieData)=>{
	// 	res.json(JSON.parse(movieData));
	// });

	request.get(searchUrl,(error,response,movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movie_list', { 
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "You searched for " + termUserSearchedFor
			 
		});
			

	// res.json(req.body);
	});
});

router.get('/movie/:id', (req,res)=>{
	// the route has a :id in it. A : means WILDCARD
	// a wildcard is ANYTHING in that slot.
	// all wildcards in routes are available in req.params
	var thisMovieId = req.params.id;
	var thisMovieUrl = `${apiBaseUrl}/movie/${thisMovieId}?api_key=${config.apiKey}`;
	var thisCastUrl =  `${apiBaseUrl}/movie/${thisMovieId}/credits?api_key=${config.apiKey}`;

	request.get(thisMovieUrl,(error,response,movieData)=>{
		request.get(thisCastUrl,(error,response,castData)=>{
			var newMovieData = JSON.parse(movieData);
			var newCastData = JSON.parse(castData);
			// res.json(castData);

			res.render('single-movie', { 
			movieData: newMovieData,
			imageBaseUrl: imageBaseUrl,
			castData: newCastData
			 
		});
		
		// res.json(movieData);
		// res.render('single-movie', {
		// 	movieData: movieData,
		// 	imageBaseUrl: imageBaseUrl

// https://api.themoviedb.org/3/credit/{credit_id}?api_key=<<api_key>>

		});
	});
	// res.json(req.params.id);
});


module.exports = router;
