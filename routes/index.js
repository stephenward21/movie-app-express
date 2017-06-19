var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('./config');
var bcrypt = require('bcrypt-nodejs');

var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database

});

connection.connect();

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
			// console.log(thisMovieId);
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
router.get('/register', (req, res)=>{
	// res.send("THis is teh register page.")
	var message = req.query.msg;
	if(message == "badEmail"){
		message = "This email is already registered";
	}
	res.render('register',{message: message});
});

router.post('/registerProcess', (req,res)=>{
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var hash = bcrypt.hashSync(password);

	console.log(hash);


	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery,[email],(error, results)=>{
		if(results.length == 0 ){
			// User is not in the db. Insert them
			var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
			connection.query(insertQuery, [name,email,hash], (error,results)=>{
				// Add session vars -- name, email, loggedin, id
				req.session.name = name;
				req.session.email = email;
				req.session.loggedin = true;
				res.redirect('/?msg=registered')
			});
		}else{
			// User is in the db. Send them back to register with a message
			res.redirect('/register?msg=badEmail');
		}

	});
	// res.json(req.body);
});

router.get('/login', (req, res)=>{
	// res.send('login');
	res.render('login',{ });
	
});

router.post('/processLogin', (req,res)=>{
	// res.json(req.body);
	var email = req.body.email;
	var password = req.body.password;

	// var selectQuery = "SELECT * FROM users WHERE email = ? AND password = ?";

	var selectQuery = "SELECT * FROM users WHERE email = ?";

	connection.query(selectQuery, [email], (error,results)=>{
		if(results.length == 1){
			var match = bcrypt.compareSync(password, results[0].password); // true
			if (match){
				req.session.loggedin = true;
				req.session.name = results[0].name;
				req.session.email = results[0].email;
				res.redirect('/?msg=loggedin');
			}else{
				res.redirect('/login?msg=badLogin');
			}

		}else{
			res.redirect('/login?msg=badLogin');
		}
	});
});


module.exports = router;
