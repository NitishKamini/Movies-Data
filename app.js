const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "moviesData.db");
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error message: ${error.message}`);
  }
};

initializeDBAndServer();

// API - ONE

const convertMovieObject = (eachObject) => {
  return {
    movieName: eachObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => convertMovieObject(eachMovie)));
});

// API - TWO

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `INSERT INTO movie(director_id, movie_name, lead_actor)
                            VALUES(${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await database.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

// API - THREE

const convertDbObj = (eachObject) => {
  return {
    movieId: eachObject.movie_id,
    directorId: eachObject.director_id,
    movieName: eachObject.movie_name,
    leadActor: eachObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getMovieDetailsQueryResponse = await database.get(getMovieDetailsQuery);
  response.send(convertDbObj(getMovieDetailsQueryResponse));
});

// API - FOUR

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `UPDATE movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
                                    WHERE movie_id = ${movieId};`;
  const dbResponse = await database.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

// API - FIVE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API - SIX

const converDirectorObj = (eachObject) => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * from director;`;
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => converDirectorObj(eachDirector))
  );
});

// API - SEVEN

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `SELECT movie_name FROM movie INNER JOIN director ON movie.director_id = director.director_id WHERE director.director_id = ${directorId};`;
  const directormoviesArray = await database.all(getDirectorMovies);
  response.send(
    directormoviesArray.map((eachMovie) => convertMovieObject(eachMovie))
  );
});

module.exports = app;
