// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import * as auth from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import * as database from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 
  authDomain: "tic-tac-toe-48675.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-48675-default-rtdb.firebaseio.com",
  projectId: "tic-tac-toe-48675",
  storageBucket: "tic-tac-toe-48675.appspot.com",
  messagingSenderId: "333264083922",
  appId: "1:333264083922:web:c467212efc347b835d060b",
  measurementId: "G-H3FWPT3XGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const authn = auth.getAuth(app);
const db = database.getDatabase(app);

let btnRef = document.querySelectorAll(".button-option");
let popupRef = document.querySelector(".popup");
let wrapperRef = document.querySelector(".wrapper");
let nameRef = document.querySelector(".choose-name");
let newgameBtn = document.getElementById("new-game");
let restartBtn = document.getElementById("restart");
let msgRef = document.getElementById("message");
let xoButton = document.querySelectorAll('.button-x-o');

//Winning Pattern Array
let winningPattern = [
  [0, 1, 2],
  [0, 3, 6],
  [2, 5, 8],
  [6, 7, 8],
  [3, 4, 5],
  [1, 4, 7],
  [0, 4, 8],
  [2, 4, 6],
];

(function () {
  let playerId;
  let playerRef;
  let players = {};
  let counter = 0;
  //Player 'X' plays first
  let xTurn = true;
  let count = 0;

  function initGame() {
    const allPlayersRef = database.ref(db, `players`);

    //Disable All Buttons
    const disableButtons = () => {
      btnRef.forEach((element) => (element.disabled = true));
    };

    //Enable all buttons (For New Game and Restart)
    const enableButtons = () => {
      btnRef.forEach((element) => {
        element.innerText = "";
        element.disabled = false;
      });
      //disable popup
      popupRef.classList.add("hide");
    };

    //This function is executed when a player wins
    const winFunction = (letter) => {
      disableButtons();
      //enable popup
      popupRef.classList.remove("hide");
      if (letter == "X") {
        msgRef.innerHTML = "&#x1F389; <br> 'X' Wins";
      } else {
        msgRef.innerHTML = "&#x1F389; <br> 'O' Wins";
      }
    };

    //Function for draw
    const drawFunction = () => {
      disableButtons();
      msgRef.innerHTML = "&#x1F60E; <br> It's a Draw";
    };

    //Win Logic
    const winChecker = () => {
      //Loop through all win patterns
      for (let i of winningPattern) {
        let [element1, element2, element3] = [
          btnRef[i[0]].innerHTML,
          btnRef[i[1]].innerHTML,
          btnRef[i[2]].innerHTML,
        ];
        //Check if elements are filled
        //If 3 empty elements are same and would give win as would
        if (element1 != "" && (element2 != "") & (element3 != "")) {
          if (element1 == element2 && element2 == element3) {
            //If all 3 buttons have same values then pass the value to winFunction
            winFunction(element1);
          }
        }
      }
    };

    //Display X/O on click
    const playGame = (text) => {
      btnRef.forEach((element) => {
        element.addEventListener("click", () => {
          element.innerText = text;
          element.disabled = true;
          //Increment count on each click
          count++;
          if (count == 9) {
            drawFunction();
          }
          //Check for win on every click
          winChecker();
        });
      });
    }

    //New Game
    newgameBtn.addEventListener("click", () => {
      count = 0;
      enableButtons();
    });

    restartBtn.addEventListener("click", () => {
      count = 0;
      enableButtons();
    });


    database.onValue(allPlayersRef, (snapshot) => {
      //Fires whenever a change occurs
      players = snapshot.val() || {};
      console.log(players);
      Object.keys(players).forEach((key) => {
        const characterName = players[key].name;
        console.log(characterName);
        enableButtons();
        if (characterName == 'X') {
          playGame('X');
        } else {
          playGame('O');
        }
      })

    })

    database.onChildAdded(allPlayersRef, (snapshot) => {
      //Fires whenever a new node is added the tree
      const addedPlayer = snapshot.val();
      counter++;
      console.log(counter);
      if (counter < 3) {
        xoButton.forEach((element) => {
          element.addEventListener("click", () => {
            element.disabled = true;
            database.update(playerRef, {
              name: element.innerText,
            })
            wrapperRef.classList.remove("hide");
            nameRef.classList.add("hide");
          });
        })
      } else {
        xoButton.forEach((element) => (element.disabled = true));
      }
    })
  }

  auth.onAuthStateChanged(authn, (user) => {
    // console.log(user);
    // console.log(typeof (user));
    if (user) {
      //You're logged in!
      playerId = user.uid;
      playerRef = database.ref(db, `players/${playerId}`);

      database.set(playerRef, {
        id: playerId,
        name: '',
      })

      //Remove me from Firebase when I diconnect
      database.onDisconnect(playerRef).remove(playerRef);

      //Begin the game now that we are signed in
      initGame();
    } else {
      //You're logged out.
    }
  })

  auth.signInAnonymously(authn).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    console.log(errorCode, errorMessage);
  });

})();

