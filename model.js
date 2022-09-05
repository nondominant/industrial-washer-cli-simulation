var fs = require('fs');
//const config = require('./currentArray.json');
const config = require('./array.json');
//const config = require('./randomsorted.json');
//const config = require('./badlysorted.json');
//const config = require('./wellsorted.json');


/* start of global declarations */ 
let waiting_loads = [];
let tunnel = [];
let time = 0;
let turns = 0;
let dryers = {
  dryer1 : 0,
  dryer2 : 0,
  dryer3 : 0,
  dryer4 : 0,
  dryer5 : 0,
}
let lost = 0;
let paused = false;
let paused2 = false;
const keys = [
"dryer1",  
"dryer2",  
"dryer3",  
"dryer4",  
"dryer5"
]
let colours = [
"\x1b[30m\x1b[47m", //black
"\x1b[31m\x1b[46m", //red
"\x1b[32m\x1b[41m", //green
"\x1b[33m\x1b[47m", //yellow
"\x1b[34m\x1b[43m", //blue
"\x1b[35m\x1b[46m", //magenta
"\x1b[36m\x1b[41m", //cyan
]
const reset = "\x1b[0m"
/* end of global declarations */ 
const checkPaused = () => {
  if (getEmpty !== "none") {
    paused = false;
  }
}
const print_time = () => {
  process.stdout.write("Minute : _____");
  process.stdout.write("\033[5D");
  process.stdout.write(time.toString());
}
const print_turns = () => {
  process.stdout.write("\033[15C");
  process.stdout.write("___Turns : _____");
  process.stdout.write("\033[5D");
  process.stdout.write(turns.toString());
}
const decrement_dryers = () => {
  for (const key in dryers) {
    dryers[key] = (dryers[key] > 0) ? dryers[key] - 1 : 0
  }
}
const print_lost = () => {
  process.stdout.write("\033[40C ______________");
  process.stdout.write("\033[11D");
  process.stdout.write("Lost time: ");
  process.stdout.write(lost.toString());
}
const print_waiting_loads = () => {
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  console.log("____________________________________________________________________________________________________________");
  process.stdout.write("\033[8A");
  for (let i = 0; i < waiting_loads.length; i++) {
    process.stdout.write(waiting_loads[i].colour);
    process.stdout.write(waiting_loads[i].value.toString());
    process.stdout.write(", ");
    process.stdout.write(reset);
    process.stdout.write("\033[K");
    if (i % 30 === 0) { console.log(); }
  }
}
const print_dryers = () => {
      process.stdout.write("_______________________");
      process.stdout.write("\033[20D");
  for (key in dryers) {
      process.stdout.write("[");
      if (dryers[key] > 0) {
        process.stdout.write("\x1b[41m\x1b[30m");
      } else {
        process.stdout.write("\x1b[42m\x1b[30m");
      }
      process.stdout.write(dryers[key].toString());
      if (dryers[key] < 10) { process.stdout.write("_"); }
      process.stdout.write(reset);
      process.stdout.write("]");
  }
}
const print_tunnel = (tunnel) => {
  process.stdout.write("Tunnel |_");
  process.stdout.write("................................................................_|");
  process.stdout.write("\033[64D");
  for (let i = 0; i < tunnel.length; i++) {
      process.stdout.write(tunnel[i].colour)
      process.stdout.write("[");
      process.stdout.write(tunnel[i].value.toString());
      process.stdout.write("]");
      process.stdout.write(reset);
  }
}
const progress_tunnel = async (func, tunnel, dryers, next) => {
  if (paused) { return tunnel; }
  turns += 1;
  let new_arr = tunnel;
  if(tunnel.length > 15) {
    if (next != "none" ) {
      dryers[next] = new_arr.pop().value;
    } else {
      paused = true
      return tunnel;
    }
  }
  //push
  new_arr.unshift(func());
  return new_arr;
}
const getLoad = () => {
  return waiting_loads.shift();
}
const getEmpty = (dryerbank) => {
  for (const key in dryerbank) {
    if ( dryerbank[key] < 1 ) {
      return key
    } else {
    }
  }
    return "none";
}
const sleep = (x) => { return new Promise(resolve => setTimeout(resolve, x)); }

const sort_average = (test) => {
  console.log("sort_average( ", test, ")");
    let empty = new Array(test.length * 2).fill(0);
    let heap = [0];
    let temp = [];
    let step = test.length;
    while (step > 0) {
      for (let i = 0; i < heap.length; i++) {
        temp.push(heap[i] + step);
      }
      heap.push(...temp);
      step = Math.floor(step / 2);
     // heap.sort(function(a, b){return a-b});
      for (let i = 0; i < temp.length; i++) {
        empty[temp[i]] = test.pop();
      }
      temp = [];
    }
    let finished = empty.filter(x => x > 0);
  //                                                           | 0
  //100 |  0+100                                               | 100
  //50  |  0+50 100+50                                         | 50 150
  //25  |  0+25 50+25 100+25 150+25                            | 25 75 125 175
  //13  |  0+13 25+13 50+13 75+13 100+13 125+13 150+13 175+13  | 13 38 63 88 113 138 163 188
  return finished;
}
const sort = (arr) => {
    let sorted = []
    for (let i = 0; i < arr.length; i++ ) {
      let max = arr.reduce((a, b) => Math.max(a, b), -Infinity)
      sorted.push(max);
      let index = arr.indexOf(max);
      arr[index] = 0;
    }
    return sorted;
}

const main = async (obj) => {
  //waiting_loads = config;
  waiting_loads = obj;


  while (true) {
    if (waiting_loads.length <= 0) { break; }
    time++;
    decrement_dryers();
    if ( time % 2 === 0 ) {
      checkPaused();
      if ( !paused && !paused2 ) {
        let next = getEmpty(dryers);
        tunnel = await progress_tunnel(getLoad, tunnel, dryers, next)
      } 
    }

      process.stdout.write("\033[10A");//move up to compensate for waiting loads print out
      process.stdout.write("\033[13A");

      console.log();
      print_time();
      print_turns();
      console.log();
      console.log();
      console.log();
      console.log();
      if (paused) { 
        paused2 = true;
        process.stdout.write("\x1b[41m\x1b[37m");
        console.log("_____PAUSED_____") 
        process.stdout.write(reset);
        lost += 1;
        turns -= 0.5;
      } else { 
        paused2 = false;
        process.stdout.write("\x1b[42m\x1b[30m");
        console.log("_____RUNNING____") 
        process.stdout.write(reset);
      }
      print_tunnel(tunnel);
      console.log();
      console.log();
      console.log("Dryer Bank");
      print_dryers();
      print_lost();
      console.log();
      console.log();
      print_waiting_loads();
      await sleep(200);
  }
}


const generate_array = (number) => {
  let loads = [];
  for (let i = 0; i < number; i++) {
    loads.push(getRandom());
  }
  return loads;
}

const populate = async () => {
  let loads = config;

  // loads = sort(loads);
  /* toggle */

  //loads = sort_average(loads);

  objArray = [];
  let green = "\x1b[42m\x1b[30m"
  let orange = "\x1b[43m\x1b[30m"
  let red = "\x1b[41m\x1b[37m"
  let load_colour = green;
  for (let x = 0; x < loads.length; x++) {
    let num = loads[x];
    load_colour = green;
    if (num > 2) {
      load_colour = orange
    }
    if (num > 15) {
      load_colour = red 
    }
    objArray.push({value: num, colour: load_colour});
  }
  return objArray;
}

const getRandom = () => {
  let dryTimes = [
    2,
    2,
    2,
    2,
    2,
    2,
    5,
    7,
    12,
    15,
    17,
    20,
  ];
  let number = Math.floor(2 + Math.random() * 20);
  let val = dryTimes[number % dryTimes.length];
  return val;
}

const writeSortedOut = async () => {
  let loads = config;
  console.log('loads.. ', loads);
  loads = sort(loads);
  loads = sort_average(loads);
  let file = [];
  for (let i = 0; i < loads.length; i++) {
    //let e = loads[i] % 1;
    //let f = e.toFixed(3);
    //let g = f * 1000;
    //let h = g.toFixed(0);
    //console.log("g = ", g);
    //file.push(g)
  }
  return loads;
}

const secondary = async () => {
  //let obj = generate_array(200);

//  let file = await writeSortedOut();
//  let json = JSON.stringify(file);
 
//const config = require('./array.json');
//const config = require('./randomsorted.json');
//const config = require('./badlysorted.json');
//const config = require('./wellsorted.json');
  
//  let id = Math.floor(100 + Math.random() * 20);
//  fs.writeFile(`./sorted/sorted${id}.json`, json, 'utf8', (err) => {
//    if (err){
//      console.log(err);
//    } else {
//      console.log("File written successfully\n");
//    }
//  });

  let obj = await populate();
  return obj;
}

const start = async () => {
  let obj = await secondary();
  main(obj);
}

 start();
