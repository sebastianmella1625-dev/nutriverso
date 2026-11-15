import React from "react";
import {Composition} from "remotion";
import {NutriVersoMotion} from "./Video";
import {FPS, TOTAL_FRAMES} from "./timing";

export const Root: React.FC = () => (
  <Composition id="NutriVersoMotion" component={NutriVersoMotion} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
);
