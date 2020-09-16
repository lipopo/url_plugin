import React from 'react';
import ReactDOM from 'react-dom';

import Popup from './popup.jsx';


let appContainer = document.querySelector("#app");
ReactDOM.render(
    React.createElement(Popup),
    appContainer
);
