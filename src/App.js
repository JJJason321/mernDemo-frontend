import React, { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import NewPlace from "./places/pages/NewPlace";
import User from "./users/pages/User";
import UserPlaces from "./places/pages/UserPlaces";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./users/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";

let logoutTimer;

function App() {
  const [token, setToekn] = useState();
  const [userId, setUserID] = useState();
  const [tokenExpirationData, setTokenExpirationDate] = useState();

  const login = useCallback((uid, token, expirationDate) => {
    setToekn(token);
    setUserID(uid);
    const tokenExpirationData =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationData);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationData.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToekn(null);
    setUserID(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    //console.log('useEffect 1 runs');
    if (token && tokenExpirationData) {
      const remainingTime = tokenExpirationData.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    }else{
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationData]);

  useEffect(() => {
    //console.log('useEffect 2 runs');
    const storedData = JSON.parse(localStorage.getItem("userData"));
    //console.log(storedData);
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      //console.log('Local stroage do have something');
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }else{
      //console.log('Local Storage does not have anything')
    }
  }, [login]);

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <User />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/place/new" exact>
          <NewPlace />
        </Route>
        <Route path="/place/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to={"/"} />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <User />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path={"/Auth"}>
          <Auth />
        </Route>
        <Redirect to={"/auth"} />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
