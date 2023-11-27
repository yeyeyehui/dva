import { Routes, Route, Link } from "./dva/router";

import app from "./dva.js";

import Home from "./Home";

import Counter from "./Counter.js";

app.router(() => (
  <div>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/counter">Counter</Link>
      </li>
    </ul>
    <Routes>
      <Route path="/" exact={true} element={<Home />} />
      <Route path="/counter" exact={true} element={<Counter />} />
    </Routes>
  </div>
));

app.start("#root");
