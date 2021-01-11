var synth, tune, noise, loop, seq, chain;
var serial; // variable to hold an instance of the serialport library


function setup() {
  createCanvas(400, 400)
  background(0, 100, 200)
  // arduino stuff
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('list', printList); // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose); // callback for the port closing

  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port

  tune = new Tune();
  //slendro, ji_12, partch_43, young-lm_piano, johnston_81
  //these are really scales and tunings 
  tune.loadScale('young-lm_piano');
  tune.tonicize(440);
  tune.mode.output = 'frequency';

  //convert ratio into frequency 
  //maybe there's a better way to do this? 
  var scale = tune.scale.map(x => x * 440);

  //types - up, down, upDown, downUp, alternateUp, alternateDown, random, randomWalk, randomOnce
  var pattern = new Tone.CtrlPattern(scale, 'alternateUp');

  //Tone's way of doing random numbers, could also use p5.js random()
  var random = new Tone.CtrlRandom(0.1, 1);

  //control melody with markov chain 
  // this could also be used to switch between multiple melodies 
  chain = new Tone.CtrlMarkov({
    // 20 % chance of going to B3 
    // 80% of going to Ab2
    "A3": [{
      value: "B3",
      probability: 0.2
    }, {
      value: "Ab2",
      probability: 0.8
    }],
    // Equal chance of going to all 3
    "Ab2": ["Ab2", "C4", "E5"],
    "E5": ["E5", "C4"],
    "C4": "A3",
    "B3": ["C4", "E5"]
  });

  //starting place
  chain.value = "A3";

  //show tone presets 
  synth = new Tone.FMSynth({
    "harmonicity": 8,
    "modulationIndex": 2,
    "oscillator": {
      "type": "sine"
    },
    "envelope": {
      "attack": 0.001,
      "decay": 2,
      "sustain": 0.1,
      "release": 2
    },
    "modulation": {
      "type": "square"
    },
    "modulationEnvelope": {
      "attack": 0.002,
      "decay": 0.2,
      "sustain": 0,
      "release": 0.2
    }
  }).toMaster();

  var synth0 = new Tone.Synth({
    'oscillator.type': 'square10',
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0
    }
  }).toMaster()

  //pattern.next() - gives the next note in the pattern 
  //random.value - 
  seq = new Tone.Loop(time => {
    synth.triggerAttackRelease(pattern.next(), random.value, time)

    fill(100)
    ellipse(20, 20, 10, 10)
  }, '8n');

  markSeq = new Tone.Loop(time => {
    synth.triggerAttackRelease(chain.next(), 0.2, time)
  }, '8n');

  loop = new Tone.Loop(function (time) {
    synth0.triggerAttack("A2", time)
  }, 0.5).start(0)



  // get the list of ports:
  function printList(portList) {
    // portList is an array of serial port names
    for (var i = 0; i < portList.length; i++) {
      // Display the list the console:
      console.log(i + " " + portList[i]);
    }
  }

  function serverConnected() {
    console.log('connected to server.');
  }

  function portOpen() {
    console.log('the serial port opened.')
  }

  function serialEvent() {

  }

  function serialError(err) {
    console.log('Something went wrong with the serial port. ' + err);
  }

  function portClose() {
    console.log('The serial port closed.');
  }
}

function draw() {

}