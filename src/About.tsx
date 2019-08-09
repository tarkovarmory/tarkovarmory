import React from 'inferno-compat';
import ReactDOM from 'inferno-compat';

import { _ } from "translate";

export const About = () => (
    <div id='About'>
        <p>
            This site contains a collection of useful tools for those playing the game
            <a href='https://www.escapefromtarkov.com/'>Escape from Tarkov</a>. This site is not affiliated with the creators of Escape
            from Tarkov, <a href='https://www.battlestategames.com/'>Battlestate Games Limited</a>. The images and data found here are
            copyrighted by Battlesate Games Limited.
        </p>

        <p>
            Data that has been computed (such as our ammo vs armor shots to
            kill) has been calculated based on the algorithms and formulas
            used in the game, to the best of our ability to derive that
            information from their decompiled source code.
        </p>
    </div>
);

export default About;
