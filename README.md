# Web-Technologies-COMSM0104
Bristol uni course

General Idea 

Index.html contains a basic game 15

We want a page to create and login a user that is saved to the embedded database ( SQL Lite folder contains files required to run such a db )
HTTP POST - Register(username, passwords)
HTTP POST - Login(Username, password)

After a user is logged to the game page the game is shuffled into a random position. Then after each click on a square, a request is sent to the server:
HTTP POST - Move(gameId, postionX, positionY, dateTime) - it should save the request to the Moves tables
HTTP POST - GetLastMoves(gameId, moveCount) - returns all moves made with id larger than move count (for the multiplayer mode )
HTTP POST - SaveHighscore(gameId, totalMoves, totalTime)
HTTP POST - GetHighscores() - returns sorted hihscores by time and moves 

BONUS:
Image splitting and some html 5 effects
