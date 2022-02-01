import React from "react";
import Navbar from "./components2/Navbar/Navbar";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./components2/Home/Home";
import Auth from "./components/Auth/Auth";
import Footer from "./components2/Footer/Footer";
import QuizCreator from "./components2/QuizCreator/QuizCreator";
import Test from "./components2/Test/Test";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/auth" exact component={Auth} />
        <Route path="/quizCreator" exact component={QuizCreator} />
        <Route path="/test" exact component={Test} />
      </Switch>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
