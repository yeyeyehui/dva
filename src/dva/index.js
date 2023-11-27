import React from "react";

import ReactDOM from "react-dom/client";

import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
} from "redux";

import { connect, Provider } from "react-redux";

import createSagaMiddleware from "redux-saga";

import * as sagaEffects from "redux-saga/effects";

import prefixNamespace from "./prefixNamespace";

import { BrowserRouter } from "react-router-dom";

import { HistoryRouter } from "redux-first-history/rr6";

import { createBrowserHistory } from "history";

import { createReduxHistoryContext } from "redux-first-history";

const { routerReducer, routerMiddleware, createReduxHistory } =
  createReduxHistoryContext({ history: createBrowserHistory() });

export { connect };

function dva() {
  const app = {
    _modules: [],
    model,
    _router: null,
    router,
    start,
    createActionCreators,
  };

  const initialReducers = { router: routerReducer };

  function model(m) {
    const prefixModel = prefixNamespace(m);
    app._modules.push(prefixModel);
    return prefixModel;
  }

  function router(r) {
    app._router = r;
  }

  function createActionCreators() {
    const actionCreators = {};
    for (const model of app._modules) {
      const { reducers, effects } = model;
      for (const key in reducers) {
        //key=namespace/actionType
        actionCreators[key] = (payload) => ({ type: key, payload });
      }
      for (const key in effects) {
        //key=namespace/actionType
        //key=counter/goto
        actionCreators[key] = (payload) => ({ type: key, payload });
      }
    }
    return actionCreators;
  }

  function start(root) {
    for (const model of app._modules) {
      //把model对应的reducers对象转成一个reducer函数
      initialReducers[model.namespace] = getReducer(model);
    }
    const combinedReducer = createReducer();
    const sagas = getSagas(app);
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
      combinedReducer,
      applyMiddleware(routerMiddleware, sagaMiddleware)
    );
    sagas.forEach(sagaMiddleware.run);
    const history = createReduxHistory(store);
    ReactDOM.createRoot(document.querySelector(root)).render(
      <Provider store={store}>
        <HistoryRouter history={history}>{app._router()}</HistoryRouter>
      </Provider>
    );
    function createReducer() {
      //把每个model生成的reducer函数变的reducers对象进行合并,合并成一个最后的一个根reducer
      return combineReducers(initialReducers);
    }
  }

  function getSagas(app) {
    let sagas = [];
    for (const model of app._modules) {
      sagas.push(getSaga(model));
    }
    return sagas;
  }
  
  return app;
}

function getSaga(model) {
  const { effects } = model;
  return function* () {
    //rootSaga
    for (const key in effects) {
      //key = counter/asyncAdd
      yield sagaEffects.takeEvery(key, function* (action) {
        yield effects[key](action, {
          ...sagaEffects,
          put: (action) =>
            sagaEffects.put({
              ...action,
              type: prefixType(action.type, model.namespace),
            }),
        });
      });
    }
  };
}

function prefixType(type, namespace) {
  if (type.indexOf("/") === -1) {
    return `${namespace}/${type}`;
  }
  return type;
}

function getReducer(model) {
  const { reducers, state: initialState } = model;
  let reducer = (state = initialState, action) => {
    let reducer = reducers[action.type];
    if (reducer) {
      return reducer(state, action);
    }
    return state;
  };
  return reducer;
}

export default dva;
