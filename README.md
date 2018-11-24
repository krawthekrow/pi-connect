A game engine to run Only Connect games! Very much inspired by, but not affiliated with Only Connect. This is not intended to be an exact replica of Only Connect, but a simple framework to host games in a party-like setting.

Check it out at [https://krawthekrow.github.io/pi-connect/](https://krawthekrow.github.io/pi-connect/)! You do not need to fork this repository to use it. It starts out with no game data loaded, so you will need to use [pi-connect-maker](https://github.com/krawthekrow/pi-connect-maker) to generate the game configuration file and upload it using the "Config" button.

The controls for the game master can be rather unintuitive, if you've had experience with user interfaces I'd gladly take suggestions for improvement. The following documentation describes the controls in detail.

Documentation
=============

Load a game config file (`out.json` from pi-connect-maker) by clicking the "Config" button, selecting the file and pressing "Done". If you hit the button in error, you can hit "Done" to cancel. I haven't figured out how to make the modal close when you click outside of it, so please let me know if you know how to do it.

You can edit the team names. This does not affect anything in the game.

If things go wrong, you can edit the scores directly, or press "Turn" to change who's turn it is. You can also stop the timer and edit it directly, or reset it. When editing the timer, note that the timer only supports up to 9 minutes and 59 seconds, and must be in the form `m:ss`.

In the selection screens, "Next" and "Back" allows you to switch between Connections, Sequences, Walls and Vowels.

Connections and Sequences
-------------------------

During a Connections or Sequences puzzle, press "Next" to show the next clue. Note that pressing "Next" will still show the next clue even if you're on the third clue in a Sequences puzzle, so just be careful not to do that. The "Back" button brings you back to the screen where you select a hieroglyph, and has nothing to do with the "Next" button.

Nothing happens when the timer expires, so it is up to the GM to decide how to use it. The timer has expired only if it is red, so you can, for instance, allow the team to click the "Stop" button to buzz, and allow the guess only if the timer is not red.

If the team guesses correctly, hit the tick ("Correct") button. This gives the team the points and immediately reveals the solution, so don't click it until you are fine with the teams seeing the solution.

If you hit the cross ("Wrong") button, it goes to the other team to guess for one point, and all the clues are revealed. Hitting either the "Correct" or "Wrong" button then will reveal the solution, so once again be sure that you are fine with the teams seeing the solution.

For music puzzles, the music plays only as long as the timer is running. If the timer expires and you want to play the music, you can reset and start the timer again.

At any time, you can press the "Reveal" button to reveal or un-reveal the solution. This will not affect any team's score.

Walls
-----

The walls work just like in Only Connect. Players can try as many times as they like to guess the first two groups, and then they only have three guesses to guess the last two. Once the timer expires or more than three guesses are made for the second-last category, they are no longer allowed to make any more guesses. If for any reason you want to give them more time, you can go back to the selection screen and select the wall again.

If the team is unable to complete the wall, press "Reveal" to reveal the groups. The teams will then be invited to guess the connections.

If the team gets all the groups right, they will be invited to guess the connections immediately. The color differences are subtle, but once they make their last correct guess, the wall immediately transitions to guessing collections. Do not hit the "Reveal" button or it will reveal the first connection.

In the guessing connections stage, hit the "Correct" or "Wrong" buttons if the team guesses correctly or wrongly. This immediately reveals the answer, so if for example you want to give the other team an opportunity to guess, do not hit those buttons until you are fine with the teams seeing the solution.

Then, hit the "Next" button to go to the next group. Once again, the "Next" button is completely unrelated to the "Back" button, which brings you back to the selection screen.

As before, you can hit "Reveal" at any time to reveal or un-reveal the solution to the current connection.

Vowels
------

The category is shown at the same time as the puzzle clue. There is as yet no way to show the category first, and then the clue.

The timer does nothing. You are free to ignore it or use it. In a party setting, you probably want to go through all the vowels questions instead of stopping at a particular time, so you probably want to ignore it.

Hit the left or right arrow button when a team buzzes in. If the left team buzzes in, hit the left arrow, and if the right team buzzes in, hit the right arrow. Then, hit the "Correct" or "Wrong" button depending on if they get it right. If you hit the "Correct" button, the solution is immediately shown, so don't hit it until you're fine with the teams seeing the solution.

If you hit the "Wrong" button, the guessing team loses a point and other team gets to guess. If they guess correctly, hit the "Correct" button to give them a point, and hit the "Wrong" button otherwise. Either button immediately reveals the solution, so once again don't hit them until you're fine with the teams seeing the solution.

Hitting "Next" brings you to the next clue, while hitting "Back" brings you back to the walls selection screen (_not_ the previous clue).

You can hit "Reveal" at any time to reveal or un-reveal the solution for the current clue.
