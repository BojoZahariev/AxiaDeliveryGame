const game = document.querySelector('#game');
const character = document.querySelector('#character');
const van = document.querySelector('#van');
const wheel1 = document.querySelector('#wheel1');
const wheel2 = document.querySelector('#wheel2');
const fumes = document.querySelector('#fumes');

const block = document.querySelector('#block');
const score = document.querySelector('#score');
const startDiv = document.querySelector('#startDiv');
const startBtn = document.querySelector('#startBtn');
const playAgainBtn = document.querySelector('#playAgainBtn');
const background = document.querySelector('#background');
const gameOverTitle = document.querySelector('#gameOverTitle');
const santa = document.querySelector('#santa');
const form = document.querySelector('#form');
const name = document.querySelector('#name');
const submitBtn = document.querySelector('#submitBtn');
const topScores = document.querySelector('#topScores');

let scoreValue = 0;
let scoreTiming;
let checkDeadInterval;
let gameRunning = true;
let slowStart = true;

//FIREBASE
// Reference to your entire Firebase database
var database = firebase.database();

// Get a reference to the recommendations object of your Firebase.
var playersOrdered = database
  .ref()
  .child('players')
  .orderByChild('score')
  .limitToLast(5);

playersOrdered.on('value', function(snapshot) {
  displayScores(snapshot);
});

//Display Scores
const displayScores = data => {
  //clear the list
  topScores.innerHTML = '';
  let myArray = [];

  //highest score goes first
  data.forEach(function(userSnapshot) {
    myArray.unshift([userSnapshot.val().name, userSnapshot.val().score]);
  });

  let i = 0;
  myArray.forEach(el => {
    let scorePart = document.createElement('li');
    let scorePartName = document.createElement('span');
    let scorePartScore = document.createElement('span');
    scorePartName.textContent = el[0];
    scorePartScore.textContent = el[1];
    scorePart.appendChild(scorePartName);
    scorePart.appendChild(scorePartScore);

    //Medals for top 3
    if (i < 3) {
      let medal = document.createElement('img');
      if (i === 2) {
        medal.src = 'images/bronze-medal.png';
      } else if (i === 1) {
        medal.src = 'images/silver-medal.png';
      } else if (i === 0) {
        medal.src = 'images/gold-medal.png';
      }

      medal.classList.add('medals');
      scorePart.appendChild(medal);
    }

    topScores.appendChild(scorePart);

    i++;
  });
};

//Add to the scores db
let players = database.ref().child('players');

form.addEventListener('submit', e => {
  e.preventDefault();

  //profanity filter
  let badWords = ['fuck', 'cunt', 'penis', 'sex', 'vagina', 'porn', '69', 'suck', 'fuk'];
  let isInclude = badWords.some(word => name.value.includes(word));
  if (!isInclude) {
    players.push({
      name: name.value.toUpperCase(),
      score: scoreValue
    });

    form.reset();
    form.style.display = 'none';
  }
});

submitBtn.addEventListener('click', e => {
  submitBtn.style.width = '75px';
  submitBtn.textContent = 'Submit';
});

const jump = () => {
  if (character.classList === 'animate' || !gameRunning) {
    return;
  }

  character.classList.add('animate');
  setTimeout(() => {
    removeJump();
  }, 1000);
};

startBtn.addEventListener('click', () => {
  van.classList.add('animatedVan');
  fumes.style.display = 'block';

  //small delay for the jump function so it doesn't jump with the start click
  setTimeout(() => {
    document.addEventListener('click', jump);
    startDiv.style.display = 'none';
    background.classList.add('sliding');

    checkDeadInterval = setInterval(checkDead, 10);

    addObstacles();
  }, 1000);
});

playAgainBtn.addEventListener('click', () => {
  window.location.reload();
});

const removeJump = () => {
  character.classList.remove('animate');
};

//checks for collision
const checkDead = () => {
  let characterBottom = parseInt(window.getComputedStyle(character).getPropertyValue('bottom'));
  let characterWidth = parseInt(window.getComputedStyle(character).getPropertyValue('width'));
  document.querySelectorAll('.block').forEach(el => {
    let blockLeft = parseInt(window.getComputedStyle(el).getPropertyValue('left'));

    //remove the passed obstacles
    if (blockLeft < 0) {
      el.remove();

      //score increase
      scoreValue += 10;
      score.textContent = scoreValue;

      if (scoreValue % 100 === 0) {
        santa.style.display = 'block';
        santa.classList.add('santaAnimated');

        setTimeout(() => {
          santa.classList.remove('santaAnimated');
          santa.style.display = 'none';
        }, 4000);
        //increase difficulty
      } else if (scoreValue > 20) {
        slowStart = false;
      }
    }

    //mobile
    if (characterWidth < 120) {
      //checks for collision
      if (blockLeft < 145 && blockLeft > 45 && characterBottom <= 10) {
        document.querySelector('#smoke').style.display = 'block';

        //pause the blocks
        document.querySelectorAll('.block').forEach(element => {
          element.style.animationPlayState = 'paused';
        });
        gameRunning = false;

        //stop checking for collision
        clearInterval(checkDeadInterval);

        background.style.animationPlayState = 'paused';
        gameOverTitle.style.display = 'block';
        playAgainBtn.style.display = 'block';
        van.classList.remove('animatedVan');
        van.classList.add('vanCrashed');
        wheel1.classList.add('animatedWheel1');
        wheel2.classList.add('animatedWheel2');
        fumes.style.display = 'none';
        form.style.display = 'block';
      }

      //desktop
    } else {
      //checks for collision
      if (blockLeft < 190 && blockLeft > 55 && characterBottom <= 20) {
        document.querySelector('#smoke').style.display = 'block';

        //pause the blocks
        document.querySelectorAll('.block').forEach(element => {
          element.style.animationPlayState = 'paused';
        });
        gameRunning = false;

        //stop checking for collision
        clearInterval(checkDeadInterval);

        background.style.animationPlayState = 'paused';
        gameOverTitle.style.display = 'block';
        playAgainBtn.style.display = 'block';
        van.classList.remove('animatedVan');
        van.classList.add('vanCrashed');
        wheel1.classList.add('animatedWheel1');
        wheel2.classList.add('animatedWheel2');
        fumes.style.display = 'none';
        form.style.display = 'block';
      }
    }
  });
};

const addObstacles = () => {
  if (gameRunning) {
    let randomTime;

    //decreased difficulty at start
    if (slowStart) {
      randomTime = randomIntFromInterval(2500, 3000);

      //normal difficulty
    } else {
      randomTime = randomIntFromInterval(950, 3000);
    }

    let obstacle = document.createElement('img');

    //alternate the obstacles
    if (randomTime >= 2300) {
      obstacle.src = 'images/snowman.png';
    } else if (randomTime >= 1600) {
      obstacle.src = 'images/tree.png';
    } else {
      obstacle.src = 'images/gift.png';
    }

    obstacle.classList.add('block');
    obstacle.classList.add('animateBlock');
    game.appendChild(obstacle);

    setTimeout(addObstacles, randomTime);
  }
};

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
