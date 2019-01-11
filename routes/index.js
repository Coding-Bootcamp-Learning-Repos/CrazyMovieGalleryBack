var express = require('express');
var router = express.Router();
var request = require('request');

/////// DATABASE SETUP ///////

var mongoose = require('mongoose');
var options = { connectTimeoutMS: 5000, useNewUrlParser: true };
mongoose.connect('mongodb://fitzfoufou:lacapsule1@ds111623.mlab.com:11623/mymovizapp',
    options,
    function(err) {
     console.log(err);
    }
);

// Set up of database of favorite movies
var movieSchema = mongoose.Schema({
    title: String,
    overview: String,
    poster_path: String,
    id: Number
});

var MovieModel = mongoose.model('movies', movieSchema);

/////// USEFUL VARIABLES ///////

//Temporary variable to stock latest movies collected from API
var latestMovies={};

//To get the date from a month ago -- using library datejs
require('datejs');
Date.i18n.setLanguage("fr-FR");
var dateOneMonthFromToday = Date.today().last().month().toString('yyyy-MM-dd');

/////// ROUTES ///////

// Route to get the latest movies released a month ago ordered by popularity
// We used the API themoviedb to get this data
var themoviedbApiKey = "a17b8555239bd3cb58ac5274cb668ad3";
router.get('/movie', function(req, res) {
  request("https://api.themoviedb.org/3/discover/movie?api_key="+themoviedbApiKey+"&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte="+dateOneMonthFromToday, function(error, response, body) {
    latestMovies = JSON.parse(body);
    res.json(latestMovies.results);
  });
});

//Route to get the favorite movies from Mongo Database
router.get('/mymovies', function(req, res) {
  MovieModel.find(
    {},
    function(err,movies){
      favoriteMovies=movies;
      res.json(favoriteMovies);
    }
  )
});

//Route to add a movie to the database
router.post('/mymovies', function(req,res){
  var newMovie = new MovieModel (
    {title: req.body.title,
    overview: req.body.overview,
    poster_path: req.body.poster_path,
    id: req.body.id}
  );
  newMovie.save(
    function (error, newMovie) {
      res.json(newMovie);
    }
  );
})

//Route to delete a movie from the database
router.delete('/mymovies', function(req, res) {
  MovieModel.deleteOne(
    {id: req.query.id},
    function(error){
      res.json({ result : true });
    }
  )
});

router.get("/",function(req,res){
  res.json("Bom Dia");
})

module.exports = router;

/////// MINIMAL TEST ///////
// 1. Go to website, check if it renders a galery of the most recent and commercial movies
// 2. Click on "My movies" and check that you can see 3-4 movies that you have liked in the past
// 3. Click on button which tells you the number of favorite movies : is the number right? is there a popover which gives the names of three movies
// 4. Scroll down the galery of latest movies and check that there are only around 20
// 5. Check if the responsive works
