A game engine to run Only Connect games. Very much inspired by, but not affiliated with Only Connect. This is not intended to be an exact replica of Only Connect, but a simple framework to host games in a party-like setting.

Check it out at [https://krawthekrow.github.io/pi-connect/](https://krawthekrow.github.io/pi-connect/)! You do not need to fork this repository to use it. It starts out with no game data loaded, so you will need to use [pi-connect-maker](https://github.com/krawthekrow/pi-connect-maker) to generate the game configuration file and upload it through the config interface.

Documentation
=============

Load a game config file (`out.json` from pi-connect-maker) in the config interface (click "Config"), and press "Done" to start the game. If you hit the button in error, you can hit "Done" to cancel. I haven't figured out how to make the modal close when you click outside of it, so please let me know if you know how to do it.

General controls:

- Team names: You can edit them. This does not affect anything in the game.
- Scores: You can edit them, in case something goes wrong.
- Timer: You can edit it, but only if it isn't running (click "Stop"). The timer only supports periods up to `9:59`, and must be in the form `m:ss`.
	- "Start"/"Stop": Starts or stops the timer.
	- "Reset": Resets the timer to the default value for that stage (40 seconds for connections/sequences, 2.5 minutes for the wall, 1.5 minutes for vowels).
- "Prev"/"Next": In the selection menu, changes which stage you're in. In a puzzle, changes which clue you're at.
	- When solving a wall, this reveals the solved wall, and advances to the substage where the team guesses the connections.
- "Back": Returns to the selection menu. In the vowels stage, goes back to the wall selection menu.
- "Config": Opens the config interface, where you can load a new game. Click "Done" to exit.
	- You can also perform a coin toss here to decide who goes first. It does not affect anything in the game.
	- You can configure buzzers (game controllers) here. Game controllers are automatically detected and displayed when they are plugged in. If the controller is already plugged in when you open the app, press a button on the controller to allow the app to detect it. The indicator on the screen will flash when any button or axis is moved, indicating a buzz. Click on the indicator to change which team is registered to each buzzer.
- "Turn": Change which team's turn it is.
- "Reveal": Reveals or un-reveals the solution to the current puzzle. This does not affect any scores.

Connections and Sequences
-------------------------

During a Connections or Sequences puzzle, press "Next" to show the next clue. Nothing happens when the timer expires, so it is up to you to decide how to use it. The timer has expired only if it is red, so you can, for instance, allow the team to click the "Stop" button to buzz, and allow the guess only if the timer is not red.

If the team guesses correctly, hit the tick ("Correct") button. This gives the team the points and immediately reveals the solution, so don't click it until you are fine with the teams seeing the solution.

If you hit the cross ("Wrong") button, it goes to the other team to guess for one point, and all the clues are revealed. Hitting either the "Correct" or "Wrong" button will then reveal the solution, so once again be sure that you are fine with the teams seeing the solution.

For music puzzles, the music plays only as long as the timer is running. If the timer expires and you want to play the music, you can reset and start the timer again.

Walls
-----

The walls work just like in Only Connect. Players can try as many times as they like to guess the first two groups, and then they only have three tries to guess the last two. Once the timer expires or three guesses are made for the second-last group, the team is no longer allowed to make guesses.

If the team is unable to complete the wall, press "Next" to reveal the groups. The teams will then be invited to guess the connections. If the team gets all the groups right, they will be invited to guess the connections immediately.

When guessing connections, hit tick ("Correct") or cross ("Wrong") if the team guesses correctly or wrongly. This immediately reveals the answer, so if for example you want to give the other team an opportunity to guess, do not hit those buttons until you are fine with the teams seeing the solution.

Then, click "Next" to go to the next group. If you accidentally click "Next" multiple times, you can click "Prev" to go back.

If a team finds all the groups and gets all the connections right, they will be awarded two extra points, just as in Only Connect.

Vowels
------

For each category, the category is shown first, followed by the clues. Press "Next" to advance through the clues.

The timer does nothing. You are free to ignore it or use it. In a party setting, you probably want to go through all the vowels questions instead of stopping at a particular time, so you probably want to ignore it.

Hit the left or right arrow button when a team buzzes in. If the left team buzzes in, hit the left arrow, and if the right team buzzes in, hit the right arrow. Then, hit the "Correct" or "Wrong" button depending on if they get it right. If you hit the "Correct" button, the solution is immediately shown, so don't hit it until you're fine with the teams seeing the solution.

If you hit the "Wrong" button, the guessing team loses a point and other team gets to guess. If they guess correctly, hit the "Correct" button to give them a point, and hit the "Wrong" button otherwise. Either button immediately reveals the solution, so once again don't hit them until you're fine with the teams seeing the solution.
