class Sound {

    url = '';

    buffer = null;

    sources = [];

    constructor(url) {
        this.url = url;
    }

    load() {
        if (!this.url) return Promise.reject(new Error('Missing or invalid URL: ', this.url));

        if (this.buffer) return Promise.resolve(this.buffer);

        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            request.open('GET', this.url, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously:

            request.onload = () => {
                context.decodeAudioData(request.response, (buffer) => {
                    if (!buffer) {
                        console.log(`Sound decoding error: ${ this.url }`);

                        reject(new Error(`Sound decoding error: ${ this.url }`));

                        return;
                    }

                    this.buffer = buffer;

                    resolve(buffer);
                });
            };

            request.onerror = (err) => {
                console.log('Sound XMLHttpRequest error:', err);
                reject(err);
            };

            request.send();
        });
    }

    play(volume = 1, time = 0) {
        if (!this.buffer) return;

        // Create a new sound source and assign it the loaded sound's buffer:
        const source = context.createBufferSource();
        source.buffer = this.buffer;

        // Keep track of all sources created, and stop tracking them once they finish playing:
        const insertedAt = this.sources.push(source) - 1;
        source.onended = () => {
            source.stop(0);
            this.sources.splice(insertedAt, 1);
        };

        // Create a gain node with the desired volume:
        const gainNode = context.createGain();
        gainNode.gain.value = volume;

        // Connect nodes:
        source.connect(gainNode).connect(context.destination);

        // Start playing at the desired time:
        source.start(time);
    }

    stop() {
        // Stop any sources still playing:
        this.sources.forEach((source) => {
            source.stop(0);
        });

        this.sources = [];
    }

}

const resultForm = document.getElementById("resultPopUp");
const canvas = document.getElementById("canvas");
const mainPage = document.getElementById("mainPage");
const landPage = document.getElementById("landingPage");
const spinCounter = document.getElementById("spinCounter");
const wheel = document.getElementById("wheel_image");
const stopper = document.getElementById("stopper");
const errorDisplay = document.getElementById("error-message-display");
const audioRes = "click-sound"
const audio = document.getElementById("click-sound");
const clickSound = new Sound("resources/click-sound.wav")

const spinButton = document.getElementById("spin");
spinButton.addEventListener("click", startSpin);
const redeemButton = document.getElementById("redeem");
redeemButton.addEventListener("click", loadPage);
redeemButton.addEventListener("click", getOutcomes);
redeemButton.addEventListener("click", getSpinTimes);

const options = ["RM100", "RM30", "RM150", "RM5", "RM500", "RM1000", "RM250", "RM50", "RM3", "try again", "RM8", "RM20", "RM1", "RM10"];
const values = [1, 100, 5, 50, 3, 30, 1000, 10, 250, 20, 150, 8, 500, 0];
const valuesInOrder = [1, 100, 5, 50, 3, 30, 1000, 10, 250, 20, 150, 8, 500, 0]; //options in the order that the wheel will spin


const ARC = (Math.PI * 2) / options.length;

const MODES = {
    Normal: 0,
    Bounce: 1,
    Random: 2
};

const spinMode = MODES.Normal;
const spinTimeTotal = 8000;
const stopperFallSpeed = 2;


var outcomesArray = [0]; //from database
// var spinLimit = 2; //from database

var spinTimesPromise; // Declare a Promise
var existingCodesPromise; // Declare a Promise
var codeStatusPromise; // Declare a Promise
var spinLimit; //length of outcomesArray
var userCode; //from input box
var existingCodes = []; //from database
var codeStatus; //from database

var ctx;
var spinCount = 1; //set to lowest spinCount from database
var total = 0;
var revolutions = 30;
var deltaTime = 30;



var currentAngle = {angle: 0, stopper: 0};
var finalAngle = 0;
var tileCount = 0;
var stopperVelocity = 0;
var elapsedTime = 0;

var flag = false;


var spinTimeout = null;


const Spin = {Normal: function() {}, Bounce: function() {}}

Spin.Normal = function(tween) {
    //finalAngle += ARC * 0.4
    finalAngle += Math.randSign() * Math.random() * 0.3 * ARC;
    tween.to({angle: finalAngle}, spinTimeTotal, createjs.Ease.EaseOutCubic);
}

Spin.Bounce = function(tween) {
    let bounceRand = Math.random() * 0.3;
    //finalAngle += (0.2) * ARC; //Centre 
    finalAngle += (bounceRand) * ARC;
    //tween.to({angle: finalAngle}, spinTimeTotal, createjs.Ease.getBackOut(0.3 + bounceRand/3));
    //let dampeningCoef = (1 - Math.pow(6, -3.5*bounceRand)) * 2
    let dampeningCoef = 2.807 + ( 8 * Math.pow(bounceRand, 1.29) )
    //console.log(dampeningCoef)
    //2.8 + dampeningCoef
    tween.to({angle: finalAngle}, spinTimeTotal, createjs.Ease.EaseOverShoot(dampeningCoef));
}

createjs.Ease.EaseOutCubic = function (t) {
    return 1 - Math.pow(3, -7*t) + 0.0005;
}


createjs.Ease.EaseOverShoot = function(dampening) {
    return function (t) {
        return 1 - Math.pow(2, -9 * t) * Math.cos(t * Math.PI) * Math.pow(Math.E, -dampening * t);
    }
}

Math.randSign = function () {
    return Math.sign(Math.random() - Math.random())
};

Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  let red   = Math.sin(frequency*item+2+phase) * width + center;
  let green = Math.sin(frequency*item+0+phase) * width + center;
  let blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  return RGB2Color(red,green,blue);
}

function updateSpinCounter(num, limit) {
    spinCounter.textContent = "\nFree Spin: " + num + "/" + limit;
}

function startSpin() {
    spinButton.disabled = true;
    disabledStyle();
    updateSpinCounter(spinCount-1, spinLimit);

    
    //set destination angle for the wheel
    finalAngle = (ARC * valuesInOrder.indexOf(outcomesArray[spinCount - 1]))
    finalAngle += (Math.PI * 2) * revolutions * spinCount;
    const tween = createjs.Tween.get(currentAngle, {override:true, onComplete: onComplete})
    
    switch (spinMode) {
        case 0 :
            Spin.Normal(tween)
            break;
        case 1:
            Spin.Bounce(tween)
            break;
        case 2:
            switch(Math.floor(Math.random() * 2)) {
                case 0 :
                    Spin.Normal(tween)
                    break;
                case 1:
                    Spin.Bounce(tween)
                    break;
            } 
    }
    flag = false;
    spinUpdate();
};



function onComplete() {
    stopSpin();
    return;
};


function getSpinVelocity(tileDifference) {
    let vel = tileDifference * (30/ 1000);
    //if (elapsedTime >= 500)
    vel = Math.clamp(vel, 0.13 - (elapsedTime / 350), Infinity);

    //console.log(vel)
    vel *= 100;
    return (vel);
}

function onNextTile(tileDifference) {
    for(let i = 0; i < tileDifference; i++) {
    }
    //on frame update 
    //console.log(getSpinVelocity(tileDifference))
    clickSound.play();
    pushStopper(-getSpinVelocity(tileDifference));
    
    
    
}

// function playClick() {
//     let snd = new Audio()
//     let src  = document.createElement("source");
//     src.type = "audio/wav";
//     src.src  = "resources/click-sound.wav";
//     snd.appendChild(src);
//     snd.play();
//     // let clickAudio = document.getElementById("click-sound");
//     // clickAudio.playbackRate = 2.0;
//     // clickAudio.play();
// }

function spinUpdate() {
    
    //drawRouletteWheel();
    updateStopper();
    rotateWheel(currentAngle.angle)

    let curTileCount = Math.floor((currentAngle.angle + ARC/2) / ARC);
    if(tileCount < curTileCount) {
        onNextTile(curTileCount - tileCount);
        tileCount = curTileCount;
        elapsedTime = 0;
    } else {
        elapsedTime += 30
    }

    spinTimeout = setTimeout('spinUpdate()', deltaTime);
}

function rotateWheel(radRotation) {
    //console.log(radRotation)
    wheel.style.transform = `rotate(${radRotation}rad)`;
}

function stopSpin() {
    flag = true
    clearTimeout(spinTimeout)
    resetStopper()
    // let degrees = currentAngle.angle;
    // console.log(currentAngle.angle)
    // let arcd = ARC * 180 / Math.PI;
    // console.log((degrees % 360) / arcd)
    // let index = Math.floor((degrees % 360) / arcd);
    // //ctx.save();
    // //ctx.font = 'bold 30px Helvetica, Arial';
    // let text = "RM" + values[index]
    // let value = values[index]
    // console.log(index, text, value)

    let value = outcomesArray[spinCount - 1]

    //ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10); 
    //ctx.restore();

    if(value != 0){
        showTotal(value);
    }
    updateStatus();
    spinCount++;
    updateSpinCounter(spinCount-1, spinLimit);

    if (spinCount <= spinLimit){
        spinButton.disabled = false;
        enabledStyle();
    }
    else {
        spendCode();
        openForm();
    }
}

function showTotal(amount) {
    let sum = amount + total;
    let amountString = sum.toString();
    // Get the target header element by its ID
    let targetHeader = document.getElementById("total");

    // Set the text content of the header element
    targetHeader.textContent = amountString;
    total = sum;
}

function openForm() {
    let dimmer = document.getElementsByClassName("dimmer");
    dimmer[0].style.display = "block";

    mainPage.style.pointerEvents = "none";
    resultForm.style.display = "flex";

    let userCodeLabel = document.getElementById("user-code");
    userCodeLabel.textContent = userCode;
    let rewardLabel = document.getElementById("reward");
    rewardLabel.textContent = total.toString();
}

function loadPage() {
    clickSound.load();
    userCode = document.getElementById("redeemBox").value;
    existingCodesPromise = getCodes(); 
    codeStatusPromise = getCodeStatus();
    
    //Check if existingCodesPromise is already resolved
    if (existingCodesPromise) {
        existingCodesPromise
            .then((result) => {
                existingCodes = result;
                let exists = existingCodes.includes(userCode);
                if(!exists){
                    errorDisplay.textContent = "*Code does not exist*";
                } else if(codeStatusPromise){
                    codeStatusPromise
                    .then((result) => {
                        codeStatus = result;
                        exists = existingCodes.includes(userCode);
                        
                        if(codeStatus == "已使用"){
                            errorDisplay.textContent = "*Code has been used*";
                        } else {
                            landPage.style.display = "none";
                            mainPage.style.display = "block";
                            
                            addToTotal();
                            document.getElementById("userLabel").textContent = "Code: " + userCode;
                            document.body.className = '';
                            // redeemCode(userCode); 
                        }
                    })
                }
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        existingCodesPromise = getCodes(); 
        // If existingCodesPromise is not resolved, fetch the codes
        existingCodesPromise
            .then((result) => {
                existingCodes = result;
                let exists = existingCodes.includes(userCode);
                if(!exists){
                    errorDisplay.textContent = "*Code does not exist*";
                } else if(codeStatusPromise){
                    codeStatusPromise
                    // console.log(codeStatusPromise)
                    .then((result) => {
                        codeStatus = result;
                        exists = existingCodes.includes(userCode);
                        
                        if(codeStatus == "已使用"){
                            errorDisplay.textContent = "*Code has been used*";
                        } else {
                            landPage.style.display = "none";
                            mainPage.style.display = "block";
                            addToTotal();
                            document.getElementById("userLabel").textContent = "Code: " + userCode;
                            document.body.className = '';
                            // redeemCode(userCode);
                        }
                    })
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

function updateStopper() {
    let range = 40
    let leftRange = -5
    currentAngle.stopper -= stopperVelocity
    currentAngle.stopper = Math.clamp(currentAngle.stopper, leftRange, range)

    if(Math.abs(currentAngle.stopper) == range || currentAngle.stopper == leftRange){
        stopperVelocity = 0;
    }

    // (1 / cos(angle in degrees)) - 0.5
    let moment = (1/Math.cos(Math.abs(currentAngle.stopper) * Math.PI/180)) - 0.5

    stopperVelocity += stopperFallSpeed * Math.sign(currentAngle.stopper) * moment;
    stopperVelocity *= 0.995;

    if (flag == true) {
        if (Math.abs(currentAngle.stopper) < stopperVelocity) {
            stopperVelocity = 0;
            currentAngle.stopper = 0;
        }
    }

    stopper.style.transform = `rotate(${-currentAngle.stopper}deg)`;
}

function resetStopper() {
    let recurring = null;
    updateStopper()
    if (currentAngle.stopper != 0)
        recurring = setTimeout('resetStopper()', deltaTime);
}


function pushStopper(impulse){
    stopperVelocity = impulse * 3;
}

function addToTotal(){
    spinTimesPromise = getSpinTimes();
    // console.log(spinTimesPromise)
    if(spinTimesPromise){
        spinTimesPromise
            .then((result) => {
                spinCount = result;
                let sum = 0;
                for (let i = 0; i < spinCount - 1; i++){
                    sum += parseInt(outcomesArray[i]);
                }
                // console.log(sum);
                total = sum;
                updateSpinCounter(spinCount-1, spinLimit);

                showTotal(0);
            })
    } else{
        spinTimesPromise = getSpinTimes();
            spinTimesPromise
                .then((result) => {
                    spinCount = result;
                    let sum = 0;
                    for (let i = 0; i < spinCount - 1; i++){
                        sum += parseInt(outcomesArray[i]);
                    }
                    total = sum;
                    updateSpinCounter(spinCount-1, spinLimit);

                    showTotal(0);
                })
    }
    
}


function disabledStyle(){
    spinButton.style.border = "5px solid #2b2e6b";
    spinButton.style.backgroundColor = "white";
    spinButton.style.color = "#2b2e6b";
}

function enabledStyle(){
    spinButton.style.border = "none";
    spinButton.style.backgroundColor = "#2b2e6b";
    spinButton.style.color = "white";
}

//interactions with the database
function getOutcomes() {
    // console.log("Getting outcomes...");
    jQuery.ajax({
        type: "POST",
        url: 'database_connect.php',
        dataType: 'json',
        data: {functionname: 'getOutcomes', arguments: [userCode]},
    
        success: function (obj, textstatus) {
                      if( !('error' in obj) ) {
                        myVariable = obj.result;
                        let outcomes = [];
                        //loop through the array and store the values as ints
                        for (let i = 0; i < myVariable.length; i++){
                            outcomes.push(parseInt(myVariable[i]));
                        }
                        
                        // console.log(outcomes);
                        outcomesArray = outcomes;
                        spinLimit = outcomesArray.length;
                        updateSpinCounter(spinCount-1, spinLimit);


                      }
                      else {
                          console.log(obj.error);
                      }
                }
    });
}


function getSpinTimes(){
    return new Promise((resolve, reject) => {
            jQuery.ajax({
                type: "POST",
                url: 'database_connect.php',
                dataType: 'json',
                data: { functionname: 'getLowestSpintimes', arguments: [userCode] },
                success: function (obj, textstatus) {
                    if (!('error' in obj)) {
                        const spinTimes = obj.result;
                        console.log(spinTimes);
                        resolve(spinTimes); // Resolve the Promise with the codeStatus
                    } else {
                        console.log(obj.error);
                        reject(obj.error); // Reject the Promise with the error message
                    }
                },
                error: function (obj, textstatus) {
                    const errorMessage = "code doesn't exist";
                    console.error(errorMessage);
                    reject(errorMessage); // Reject the Promise with the error message
                }
            });
        });
}

function updateStatus(){
    jQuery.ajax({
        type: "POST",
        url: 'database_connect.php',
        dataType: 'json',
        data: {functionname: 'setToSpinned', arguments: [userCode, spinCount]}, 
    
        success: function (obj, textstatus) {
                      if( !('error' in obj) ) {
                        myVariable = obj.result;
                        
                      }
                      else {
                          console.log(obj.error);
                      }
                }
    });
}

function setToRedeemed(){
    jQuery.ajax({
        type: "POST",
        url: 'database_connect.php',
        dataType: 'json',
        data: {functionname: 'updateRandomCode', arguments: [userCode]}, 
    
        success: function (obj, textstatus) {
                      if( !('error' in obj) ) {
                        myVariable = obj.result;

                      }
                      else {
                          console.log(obj.error);
                      }
                }
    });
}

function getCodeStatus() {
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            type: "POST",
            url: 'database_connect.php',
            dataType: 'json',
            data: { functionname: 'getCodeStatus', arguments: [userCode] },
            success: function (obj, textstatus) {
                if (!('error' in obj)) {
                    const codeStatus = obj.result;
                    // console.log(codeStatus);
                    resolve(codeStatus); // Resolve the Promise with the codeStatus
                } else {
                    console.log(obj.error);
                    reject(obj.error); // Reject the Promise with the error message
                }
            },
            error: function (obj, textstatus) {
                const errorMessage = "code doesn't exist";
                console.error(errorMessage);
                reject(errorMessage); // Reject the Promise with the error message
            }
        });
    });
}


function getCodes() {
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            type: "POST",
            url: 'database_connect.php',
            dataType: 'json',
            data: { functionname: 'readCode', arguments: [0] },
            success: function (obj, textstatus) {
                if (!('error' in obj)) {
                    resolve(obj.result);
                } else {
                    reject(obj.error);
                }
            },
            error: function (obj, textstatus) {
                reject(obj.error);
            }
        });
    });
}


function spendCode(){
    jQuery.ajax({
        type: "POST",
        url: 'database_connect.php',
        dataType: 'json',
        data: {functionname: 'updateUsedStatus', arguments: [userCode]}, 
    
        success: function (obj, textstatus) {
                      if( !('error' in obj) ) {
                        myVariable = obj.result;
                        
                      }
                      else {
                          console.log(obj.error);
                      }
                }
    });
}

// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
