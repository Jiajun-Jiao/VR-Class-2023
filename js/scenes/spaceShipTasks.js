import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { rcb } from '../handle_scenes.js';
import * as croquet from "../util/croquetlib.js";

let BALL_POS = cg.mTranslate(-.75,1.5,.5);
let BOX_POS = cg.mTranslate(-1,1.25,.5);
let DONUT_POS = cg.mTranslate(-.75,1.25,.5);

const OBJ_SIZE = 0.06;
const TARGET_SIZE = 0.08;
const SIMON_BUTTON_SIZE = .7
const DICE_SIZE = .5

let leftTriggerPrev = false;
let rightTriggerPrev = false;

const TARGET_ID = 'ball';

let hudMenu = null;
let role = null;
let viewId = null;
let alert = null;

export let updateModel = e => {
  
}

export let updateView = (event) => {

  console.log(event)
  switch (event.eventName) {
    case "joinedGame":
      if (viewId !== null){
        return
      }
      viewId = event.info.viewId
      role = event.info.role

      console.log(viewId, role, "model");

    case "waitingForPlayer":
      console.log(viewId, role, "model");
      window.clay.model.remove(hudMenu);

      hudMenu = window.clay.model.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(0, 0, 1, 1);
        g2.setColor('black');
  
        g2.textHeight(0.1)
  
        g2.fillText("Waiting for", .5, .8, 'center');
        g2.fillText("Other players...", .5, .7, 'center');
        g2.fillText("Game will", .5, .6, 'center');
        g2.fillText("Begin soon...", .5, .5, 'center');
        // g2.fillText("Your role will be:", .5, .7, 'center');
        // g2.fillText(`${role}`, .5, .6, 'center');
      });

      hudMenu.move(0, 1.25, -.25).scale(1, 1, .0001)
      break
    case "allPlayersJoined":
      window.clay.model.remove(hudMenu);

      hudMenu = window.clay.model.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(0, 0, 1, 1);
        g2.setColor('black');

        g2.fillText("All players ", .5, .8, 'center');
        g2.fillText("Have joined", .5, .6, 'center');
      
        if (! g2.drawWidgets(hudMenu)) {
          return
        }
      });

      g2.addWidget(hudMenu, 'button', 0.5, 0.4, 'grey', 'Start Game', () => { 
        window.croquetView.startGame()
      });
      hudMenu.move(0, 1.25, -.25).scale(1, 1, .0001)
      break
    case "startingGame":
        window.clay.model.remove(hudMenu);

        let target = window.clay.model.time + 30;

        setTimeout(() => {
          window.clay.model.remove(hudMenu);
        }, target)
  
        hudMenu = window.clay.model.add('cube').texture(() => {
          g2.setColor('white');
          g2.fillRect(0, 0, 1, 1);
          g2.setColor('black');
          
          g2.fillText("Game will start in:", .5, .8, 'center');
          g2.fillText(`${(target - window.clay.model.tim).toFixed(1)}`, .5, .6, 'center');
        });
        hudMenu.move(0, 1.25, -.25).scale(1, 1, .0001).color("red").opacity(Math.abs(Math.sin(window.clay.model.time)))
        break
    case "resolvedAlert":
      alert = null;
      break;
    case "newAlert":
      if (alert !== null){
        return
      }
      alert = event.info;
      console.log(alert)

      hudMenu = window.clay.model.add('cube').texture(() => {
        g2.setColor([1, 0.38, 0.27, 0.15 + (Math.sin(window.clay.model.time)  * 0.25)]);
        g2.fillRect(0, 0, 1, 1);
        g2.setColor('black');
        g2.fillText('New Alert!!!', .5, .5, 'center');
      })

      hudMenu.move(0, 1.25, -.25).scale(1, 1, .0001)

      break;
  }
}


export const init = async model => {
  model.setTable(false);

  /**
   * ===================
   * CROQUET SETUP
   * ===================
   */
  // croquet.register("red-red-red-red");

  let gameCode = [null, null, null, null]
  let gameCodeIndex = 0;

  hudMenu = model.add('cube').texture(() => {
    g2.setColor('white');
    g2.fillRect(0, 0, 1, 1);
    g2.setColor('black');
    g2.fillText('Enter code', .5, .9, 'center');
  

    let indx = 1;
    for (const code of gameCode){
      if (code !== null){
        g2.setColor(code);
      } else if (indx === (gameCodeIndex + 1)) {
          if (Math.sin(8 * model.time) < 0.5) {
            g2.setColor('black');
          } else {
            g2.setColor('white');
          }
      } else {
        g2.setColor('black');
      }
      g2.fillRect( (0.2 * (indx)) - 0.05, 0.65, 0.1, 0.1);

      indx ++;
    }

    if (! g2.drawWidgets(hudMenu)) {
        return
    }
  });

  hudMenu.move(0, 1.25, -.25).scale(1, 1, .0001)

  let codeButtons = [['red', 'green', 'blue', 'pink'], ['cyan', 'magenta', 'yellow', 'orange']];

  let rowIndx = 1;
  for (const codeButttonRow of codeButtons){
    let columnIndx = 1;
    for (const codeButton of codeButttonRow){
      g2.addWidget(hudMenu, 'button', (0.2 * (columnIndx)), .25 * rowIndx, codeButton, '   ', () => { 
        if (gameCodeIndex >= 4) {
          return
        }
        gameCode[gameCodeIndex] = codeButton;
        gameCodeIndex++;
      });
      columnIndx ++;
    }
    rowIndx ++;
  }

  g2.addWidget(hudMenu, 'button', 0.25, 0.1, 'grey', 'Join Game', () => { 
    if (gameCodeIndex < 4) {
      return
    }
    const croquetCode = gameCode.join('-');
    croquet.register(croquetCode);

    model.remove(hudMenu);

  });

  g2.addWidget(hudMenu, 'button', 0.75, 0.1, 'grey', '  Clear  ', () => { 
    gameCode = [null, null, null, null];
    gameCodeIndex = 0;
  });

  /**
   * ===================
   * TASK 1 CODE
   * ===================
   */
  const initObject = (obj, id, pos) => {
    obj.pos = pos
    obj.id = id
    obj.prevPos = [0, 0, 0]
    obj.handleMove = (mlPos) => {
      const isLeftControllerInObj  = isPointInObject(mlPos, obj);
      if (isLeftControllerInObj) {

        let leftTrigger = buttonState.left[0].pressed;
        // IF THE LEFT TRIGGER IS SQUEEZED
        if (leftTrigger) {
          // COLOR THE OBJ PINK AND MOVE THE OBJ.
          obj.color(1,.5,.5);
          // ON LEFT DOWN EVENT:
          if (!leftTriggerPrev) {
            // INITIALIZE PREVIOUS LOCATION.
            obj.prevPos = mlPos;
          } else {
            obj.pos = cg.mMultiply(cg.mTranslate(cg.subtract(mlPos, obj.prevPos)), obj.pos);
          }
          // REMEMBER PREVIOUS LOCATION.
          obj.prevPos = mlPos;
        } else {
          obj.color(1,1,1);
        }
        leftTriggerPrev = leftTrigger;
      }
    }

    return obj;
  }

  let ball = model.add('sphere')
  let box = model.add('cube')
  let donut = model.add('donut')
  ball = initObject(ball, 'ball', BALL_POS)
  box = initObject(box, 'box', BOX_POS)
  donut = initObject(donut, 'donut', DONUT_POS)

  const sampleTask1Objs = [ball, box, donut]

  let sampleTask1 = model.add()
    .move(-.75, 1.5, 0.5)
    .scale(TARGET_SIZE)

  sampleTask1.add('cube')
    .texture(() => {
      g2.setColor('black');
      g2.textHeight(.1);
      g2.fillText('Inertial Damping\nRegulator', .5, .9, 'center');
    })
    .move(0, 0.5, 0)
    .scale(1.5, 1.5, 0.001)

  let targetBox = sampleTask1.add('cube').opacity(0.6)

  const isPointInObject = (p, obj) => {
    if (!obj || !obj.getMatrix()) {
      return false;
    }
    let q = cg.mTransform(cg.mInverse(obj.getMatrix()), p);
    return q[0] >= -1 & q[0] <= 1 &&
      q[1] >= -1 & q[1] <= 1 &&
      q[2] >= -1 & q[2] <= 1 ;
  }

  /**
   * ===================
   * TASK 2 CODE
   * ===================
   */
  let sampleTask2 = model.add()
    .move(0, 1.5, 0.5)
    .scale(TARGET_SIZE)

  sampleTask2.add('cube')
  .texture(() => {
    g2.setColor('black');
    g2.textHeight(.1);
    g2.fillText('Tachyon Compression\nField Interface', .5, .9, 'center');
  })
  .move(0, 0.25, 0)
  .scale(1.5, 1.5, 0.001)

  const codeProgress = sampleTask2.add()
    .move(0, .65, 0)

  const codeSeq1 = codeProgress.add('cube')
    .move(-.8, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq2 = codeProgress.add('cube')
    .move(-.4, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq3 = codeProgress.add('cube')
    .move(.0, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq4 = codeProgress.add('cube')
    .move(.4, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq5 = codeProgress.add('cube')
    .move(.8, 0, 0)
    .scale(0.2, 0.2, 0.1)

  const codeSequence = [codeSeq1, codeSeq2, codeSeq3, codeSeq4, codeSeq5]

  const simonButtonRed = sampleTask2.add('cube')
    .color(1, 0, 0)
  simonButtonRed.id = 'red'
  simonButtonRed.pos = [-1.75, -.5, 0]
  const simonButtonGreen = sampleTask2.add('cube')
    .color(0, 1, 0)
  simonButtonGreen.id = 'green'
  simonButtonGreen.pos = [0, -.5, 0]
  const simonButtonBlue = sampleTask2.add('cube')
    .color(0, 0, 1)
  simonButtonBlue.id = 'blue'
  simonButtonBlue.pos = [1.75, -.5, 0]
  const simonButtonYellow = sampleTask2.add('cube')
    .color(1, 1, 0)
  simonButtonYellow.id = 'yellow'
  simonButtonYellow.pos = [-1, -2.25, 0]
  const simonButtonPurple = sampleTask2.add('cube')
    .color(1, 0, 1)
  simonButtonPurple.id = 'purple'
  simonButtonPurple.pos = [1, -2.25, 0]

  const sampleTask2Buttons = [
    simonButtonRed,
    simonButtonGreen,
    simonButtonBlue,
    simonButtonYellow,
    simonButtonPurple
  ];

  const targetSequence = ['purple', 'yellow', 'blue', 'green', 'red']
  let predictionSequence = []

  /**
   * ===================
   * TASK 3 CODE
   * ===================
   */
  let sampleTask3 = model.add()
    .move(1, 1.5, 0.5)
    .scale(TARGET_SIZE)

  sampleTask3.add('cube')
  .texture(() => {
    g2.setColor('black');
    g2.textHeight(.1);
    g2.fillText('Quantum Thrust\nSequencer', .5, .9, 'center');
  })
  .move(0, 0.25, 0)
  .scale(1.5, 1.5, 0.001)

  const dice1 = sampleTask3.add('cube')
    .move(-3, -.5, 0)
    .scale(DICE_SIZE)

  g2.addWidget(dice1, 'slider', .375, .068, '#80ffff', 'color', value => dice1.color = value);


  const dice2 = sampleTask3.add('cube')
    .move(-1.5, -.5, 0)
    .scale(DICE_SIZE)
  const dice3 = sampleTask3.add('cube')
    .move(0, -.5, 0)
    .scale(DICE_SIZE)
  const dice4 = sampleTask3.add('cube')
    .move(1.5, -.5, 0)
    .scale(DICE_SIZE)
  const dice5 = sampleTask3.add('cube')
    .move(3, -.5, 0)
    .scale(DICE_SIZE)


  model.animate(() => {
    
    if (hudMenu != null){
      // hudMenu.hud().scale(1, 1, .0001)
    }

    // if (alert !== null) {
    //   hudAlert.hud().scale(1, 1, .0001).color("red").opacity();
    // } else {
    //   hudAlert.identity().scale(0.0000001, 0.00000001, .0001).opacity(0.1);
    // }
    /**
     * ===================
     * TASK 1 CODE
     * ===================
     */
    const targetPos = targetBox.getGlobalMatrix().slice(12,15);
    const mlPos = controllerMatrix.left.slice(12,15);

    sampleTask1Objs.forEach(obj => {
      obj.handleMove(mlPos)
      obj.setMatrix(obj.pos).scale(OBJ_SIZE)

      if (obj.id === TARGET_ID) {
        const objToTargetDistance = cg.distance(obj.pos.slice(12,15), targetPos)
        const isObjInTarget = Math.abs(objToTargetDistance) < TARGET_SIZE;

        if (isObjInTarget) {
          targetBox.color(0, 1, 0)
        } else {
          targetBox.color(1, 1, 1)
        }
      }
    })

    /**
     * ===================
     * TASK 2 CODE
     * ===================
     */
    let rightTrigger = buttonState.right[0].pressed

    sampleTask2Buttons.forEach((button, i) => {
      button.identity()
        .move(...button.pos)
        .scale(SIMON_BUTTON_SIZE, SIMON_BUTTON_SIZE, 0.1)
      let center = button.getGlobalMatrix().slice(12, 15)
      let point = rcb.projectOntoBeam(center)
      let diff = cg.subtract(point, center)
      let hit = cg.norm(diff) < TARGET_SIZE*.8

      button.opacity(hit && rightTrigger ? 1 : 0.6)
    })

    if (!rightTrigger && rightTriggerPrev) {
      const hitButton = sampleTask2Buttons.find(button => {
        let center = button.getGlobalMatrix().slice(12, 15)
        let point = rcb.projectOntoBeam(center)
        let diff = cg.subtract(point, center)
        return cg.norm(diff) < TARGET_SIZE*.8
      })
      if (hitButton) {
        console.log(hitButton.id)
        let currentSeqPos = predictionSequence.length
        let expectedColor = targetSequence[currentSeqPos]

        if (hitButton.id === expectedColor) {
          predictionSequence.push(hitButton.id)
        } else {
          predictionSequence = []
        }
      }
    }
    rightTriggerPrev = rightTrigger

    codeSequence.forEach((seq,i) => {
      if (predictionSequence[i]) {
        seq.color(0, 1, 0)
      } else {
        seq.color(1, 1, 1)
      }
    })

    /**
     * ===================
     * TASK 3 CODE
     * ===================
     */

  });
}