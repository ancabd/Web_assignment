const TOTAL_TIME = 5 * 60 * 1000;

const clock = function(initialTime){
    // time when they started playing
    this.thisStartTime = initialTime;
    this.opponentStartTime = initialTime;

    // time passed before
    this.thisOffsetTime = 0;
    this.opponentOffsetTime = 0; 

    this.thisClock = document.getElementById('thisClock');
    this.opponentClock = document.getElementById('opponentClock'); 

    this.whoIsPlaying = 'NO ONE';
    
    this.thisClock.innerText = TOTAL_TIME;
    this.opponentClock.innerText = TOTAL_TIME;

    // stop the image from animating
    const clockImage = document.getElementsByClassName('onlyClock');
    clockImage[0].classList.add('pausedA');
    clockImage[0].classList.add('pausedB');
}

/**
 * Makes the clock tick for the current player (OPPONENT/THIS)
 * @param {string} player 
 */
clock.prototype.setPlayer = function(player){
    const clockImage = document.getElementsByClassName('onlyClock');

    if (player == 'THIS'){
        this.thisStartTime = Date.now();
        
        if (this.whoIsPlaying != 'NO ONE')
            this.opponentOffsetTime = this.thisStartTime - this.opponentStartTime;

        //setting clock to animate
        if (!clockImage[0].classList.contains('pausedA'))
            clockImage[0].classList.add('pausedA');
        clockImage[0].classList.remove('pausedB');
    }
    else if (player == 'OPPONENT'){
        this.opponentStartTime = Date.now();
        if (this.whoIsPlaying != 'NO ONE')
            this.thisOffsetTime = this.opponentStartTime - this.thisStartTime;

        if (!clockImage[0].classList.contains('pausedB'))
            clockImage[0].classList.add('pausedB');
        clockImage[0].classList.remove('pausedA');
    }
    else 
    {
        this.whoIsPlaying = 'NO ONE';
        clockImage[0].classList.add('pausedB');
        clockImage[0].classList.add('pausedA');
    }

    this.whoIsPlaying = player;
}

/**
 * Renders the time left and updates the game if this player has lost on time
 * @param {*} gameState 
 */
clock.prototype.renderTime = function(gameState, otherColor){

    if (this.whoIsPlaying == 'FINISHED')
        return;
        
    let t = Date.now(), thisTime = 0, opponentTime = 0;
    if (this.whoIsPlaying == 'THIS')
    {
        thisTime = t - this.thisStartTime + this.thisOffsetTime;
        opponentTime = this.opponentOffsetTime;
    }
    else if (this.whoIsPlaying == 'OPPONENT')
    {
        thisTime = this.thisOffsetTime;
        opponentTime = t - this.opponentStartTime + this.opponentOffsetTime;   
    }

    this.thisClock.innerText = milisecondsToString(TOTAL_TIME - thisTime);
    this.opponentClock.innerText = milisecondsToString(TOTAL_TIME - opponentTime);

    if (TOTAL_TIME < thisTime)
        gameState.setWinner(otherColor);
}
/**
 * Transforms miliseconds to minutes:seconds
 * @param {integer} m 
 * @returns desired string
 */
const milisecondsToString = function(m){
    if (m <= 0) return '0:00';
    let minutes = Math.floor(m/(60 * 1000));
    let seconds = Math.floor((m - minutes*60*1000)/1000);

    let s = minutes + ":";
    if (seconds <= 9)s += '0';
    s += seconds;
    return s;
}

