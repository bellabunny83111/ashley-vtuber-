export type LayerPose = { x?: number; y?: number; rotate?: number; scale?: number; opacity?: number };
export type LayerFrame = Record<string, LayerPose>;

export const layerOrder = [
  "backHair","backEars","body","leftArm","rightArm","neck","face",
  "eyes","pupils","eyelids","brows","mouth","frontHair","curls","accessories","effects"
] as const;

export const expressionFrames: Record<string, LayerFrame> = {
  neutral: { eyes:{scale:1}, mouth:{scale:1}, brows:{y:0}, backEars:{rotate:0} },
  surprised: { eyes:{scale:1.12}, pupils:{y:-1}, mouth:{scale:1.3}, brows:{y:-5}, backEars:{rotate:-4} },
  happy: { eyes:{scale:.92}, mouth:{scale:1.15}, brows:{y:-2}, accessories:{y:-1} },
  shy: { eyes:{x:2}, mouth:{scale:.85}, brows:{rotate:-2}, frontHair:{x:1} },
};

export function trackingToFrame(input:{headX?:number;headY?:number;tilt?:number;mouth?:number;blink?:number;lookX?:number}):LayerFrame{
  const tilt=input.tilt??0, mouth=input.mouth??0, blink=input.blink??0, lookX=input.lookX??0;
  return {
    face:{x:input.headX??0,y:input.headY??0,rotate:tilt},
    eyes:{scale:Math.max(.08,1-blink*.92)},
    pupils:{x:lookX*5},
    mouth:{scale:1+mouth*1.6},
    frontHair:{rotate:tilt*.82},
    backHair:{rotate:tilt*.68},
    backEars:{rotate:tilt*.76},
    curls:{rotate:tilt*.58},
    accessories:{rotate:tilt*.62},
  };
}

export function mergeFrames(...frames:LayerFrame[]):LayerFrame{
  return Object.assign({},...frames);
}
