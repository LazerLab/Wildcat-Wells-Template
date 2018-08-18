/**
 * How to use:
 * 
 * Create add a div with a name such as timer:
 * <div id="timer" class="countdown"></div>
 * 
 * Call setCountdown("timer",90);  // set "timer" to 90 seconds.
 * 
 * Routinely call advanceCountdowns();
 * 
 * Implement countdownExpried(id) to be notified when it's done.
 * 
 * Can also implement countdownUpdate(id,millis,clockString)
 * 
 */


var countdowns = new Object(); // holds the timeout in milliseconds

/**
 * @param id div id of timer
 * @param seconds
 */
function setCountdown(id,seconds) {
  countdowns[id] = [];
  countdowns[id][0] = +new Date() + seconds*1000;
  countdowns[id][1] = seconds*1000;
  
  
  var mins = Math.floor(seconds/60);
  var secondRemainder = seconds%60;
  var secondsStr = ('0'+secondRemainder).slice(-2); // add leading zero, then use last 2 digits
  
  $('#'+id).html('<div class="countdown-clock">'+mins+':'+secondsStr+'</div><div class="countdown-bar"><div class="countdown-progress"></div></div>');
}

/**
 * Call this routinely
 */
function advanceCountdowns() {
  for (id in countdowns) {
    updateCountdown(id);
  }
}

function updateCountdown(id) {
  var now = +new Date();
  var diff = countdowns[id][0]-now;
  
  var clockString = "0:00";
  if (diff > 0) {
    var fraction = 100*diff/countdowns[id][1];
    var seconds = ~~(diff/1000);
    var mins = Math.floor(seconds/60);
    var secondRemainder = seconds%60;
    var secondsStr = ('0'+secondRemainder).slice(-2); // add leading zero, then use last 2 digits
    clockString = mins+":"+secondsStr;
    $('#'+id+' .countdown-progress').css("width",fraction+"%");
  } else {
    $('#'+id+' .countdown-progress').css("width","0");
    if(typeof countdownExpired == 'function') {
      countdownExpired(id);
    }
    delete countdowns[id];
  }
  $('#'+id+' .countdown-clock').html(clockString);
  if (typeof countdownUpdate == "function") {
    countdownUpdate(id,diff,clockString);
  }
}

function stopCountdown(id) {
  delete countdowns[id];
}




