import React, { useEffect } from 'react';
import {getHours} from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";

function WelcomeMessage() {

    const date = new Date();
    const localHour = date.getHours();
    let welcome = "Hello";

    const dayComplete = useSelector(state => state.dayComplete);

    const randomWelcome = () => {
        const number = (Math.random() * 10);

        if(number >= 0 && number <3) {
            return(welcome = "It's late, grab a beer!")
        };

        if(number >= 3 && number <6) {
            return(welcome = "Time for the Gym?")
        };

        if(number >= 6 && number <=11) {
            return(welcome = "Time for a Run?")
        };
    }

    const randomDayComplete = () => {
        const number2 = (Math.random() * 10);

        if(number2 >= 0 && number2 <3) {
            return(welcome = "Smashed it today!")
        };

        if(number2 >= 3 && number2 <5) {
            return(welcome = "Time for the Gym?")
        };

        if(number2 >= 5 && number2 <7) {
            return(welcome = "Time for a Run?")
        };

        if(number2 >= 7 && number2 <9) {
            return(welcome = "Why not get out on the bike?")
        };

        if(number2 >= 9 && number2 <=11) {
            return(welcome = "Swimming Time...")
        };
    }

    if (localHour >= 4 && localHour <= 12) {
        welcome = "Good Morning";
    } else if (localHour > 12 && localHour <= 18) {
        welcome = "Good Afternoon";
    } else if (localHour > 18 && localHour <= 21) {
        welcome = "Good Evening";
    } else if (localHour > 21 && localHour <= 23) {
        randomWelcome();
    } else if (localHour >= 0 && localHour <= 2) {
        randomWelcome();
    } else if (localHour === 3) {
        welcome = "Time for Bed";
    };

    


    if (dayComplete === true) {
        randomDayComplete();
    };
    
    

    return (
      <h2 className="header__welcome">{welcome}</h2>
    );
  }
  
  export default WelcomeMessage;