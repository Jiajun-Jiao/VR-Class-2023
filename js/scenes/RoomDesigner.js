import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {

   model.setTable(false);

   let whiteBoard = model.add('cube').texture(() => {
      g2.setColor('white');
      g2.fillRect(.1,0,.8,1);
      g2.setColor('black');
      g2.fillText('White Board', .5, .9, 'center');

      if (g2.mouseState() == 'press' && !whiteBoard.isDrawing ) {
         const uvz = g2.getUVZ(whiteBoard);
         if (uvz && uvz[0]>.1 && uvz[0]<.9) {
            whiteBoard.tmpPath[0] = uvz
            whiteBoard.isDrawing = true;
         }
      } else if (g2.mouseState() == 'drag' && whiteBoard.isDrawing) {
         const uvz = g2.getUVZ(whiteBoard);

         if (uvz && uvz[0]>.1 && uvz[0]<.9) {
            whiteBoard.isDrawingTmp = true;
            const [prevU, prevV, _] =  whiteBoard.tmpPath[0];
            const [nextU, nextV, nextZ] =  uvz;

            if (Math.abs(prevU - nextU) > Math.abs(prevV - nextV)) {
               whiteBoard.tmpPath[1] = [nextU, prevV, nextZ];
            } else {
               whiteBoard.tmpPath[1] = [prevU, nextV, nextZ];
            }

         }

      } else if (g2.mouseState() == 'release' && whiteBoard.isDrawing) {
         const uvz = g2.getUVZ(whiteBoard);

         const [prevU, prevV, _] =  whiteBoard.tmpPath[0];
         const [nextU, nextV, nextZ] =  uvz;

         if (Math.abs(prevU - nextU) > Math.abs(prevV - nextV)) {
            whiteBoard.tmpPath[1] = [nextU, prevV, nextZ];
         } else {
            whiteBoard.tmpPath[1] = [prevU, nextV, nextZ];
         }
        
         whiteBoard.paths.push(whiteBoard.tmpPath);
         whiteBoard.tmpPath = [null, null];
         whiteBoard.isDrawing = false;
         whiteBoard.isDrawingTmp = false;
      }

      g2.setColor([0,0,0]);
      g2.lineWidth(.002);

      for (let n = 0 ; n < whiteBoard.paths.length ; n++){
         g2.drawPath(whiteBoard.paths[n]);
      }

      if (whiteBoard.tmpPath.length > 0 && whiteBoard.isDrawingTmp){
         console.log(whiteBoard.tmpPath)
         g2.setColor([0.5,0.5,0.5]);
         g2.lineWidth(.002);

         g2.drawPath(whiteBoard.tmpPath);
      }

   });

   whiteBoard.tmpPath = [null, null];
   whiteBoard.paths = [];
   whiteBoard.isDrawing = false;
   whiteBoard.isDrawingTmp = false;

   whiteBoard.getWalls = (scale) => {
      return whiteBoard.paths.map(wall => {
         const [[startU, startV, startZ], [endU, endV, endZ]] = wall;
         if (startU === endU){
            return {
               direction: "vertical",
               center: startV + (Math.abs(startV - endV) / 2),
               length: Math.abs(startV - endV) / 2
            }

         } else {
            return {
               direction: "horizontal",
               center: startU + (Math.abs(startU - endU) / 2),
               length: Math.abs(startU - endU) / 2
            }
         }
      })
   }
   
   let handPanel = model.add('cube').texture('media/textures/colors.jpg').opacity(.01);
   let Aswitch = false;
   let Condswitch = false;
      
   model.move(0,1.5,0).scale(.3).animate(() => {
      whiteBoard.hud().move(0, -5, -5).scale(10, 6, .0001).opacity(0.01);
      
      let m = views[0]._viewMatrix;
      let ml = controllerMatrix.left;
      handPanel.identity().move(0,-4.5,0).move(3.35*ml.slice(12,15)[0],3.35*ml.slice(12,15)[1],3.35*ml.slice(12,15)[2]);
      let hP = handPanel.getMatrix().slice(12,15);
      handPanel.setMatrix([m[0],m[4],m[8],0,m[1],m[5],m[9],0,m[2],m[6],m[10],0,hP[0],hP[1],hP[2],1]).scale(.5,.5,.01);
      if(!Condswitch && buttonState.left[1].pressed){
         Condswitch = true;
         Aswitch = !Aswitch;
         if(Aswitch){
            handPanel.opacity(.8);
         }
         else{
            handPanel.opacity(.01);
         }
      }
      else if(!buttonState.left[1].pressed){
         Condswitch = false;
      }
   });
}
