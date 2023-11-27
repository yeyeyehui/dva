import app from "./dva.js";

import { connect } from "./dva/index";

import { routerRedux } from "./dva/router";

function Counter(props) {
  return (
    <div>
      <p>{props.number}</p>
      <button onClick={props["counter/add"]}>+</button>
      <button onClick={props["counter/log"]}>log</button>
      <button onClick={props["counter/asyncAdd"]}>async+</button>
      <button onClick={() => props["counter/goto"]({ to: "/" })}>
        跳转到Home
      </button>
      <button onClick={() => props["counter/goto2"]({ path: "/" })}>
        跳转到Home
      </button>
    </div>
  );
}

// 异步
const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

app.model({
  namespace: "counter", //模型的命名空间

  state: { number: 0 }, //此模型的初始化状态对象

  reducers: {
    //处理器对象
    add(state) {
      // counter/add
      return { number: state.number + 1 };
    },

    // 打印
    log(state) {
      console.log(state, "reducers log");
      return state;
    },
  },

  effects: {
    //rootSaga  sagaMiddleware.run
    //只要有人向仓库派发asyncAdd这个动作类型，就执行此saga
    *asyncAdd(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: "add" });
    },

    *log() {
      console.log("effects log");
    },

    *goto({ payload: { to } }, { put }) {
      yield put(routerRedux.push(to));
    },

    *goto2({ payload: { path } }, { put }) {
      yield put(routerRedux.push(path));
    },
  },
});

export default connect(
  (state) => state.counter,
  app.createActionCreators()
)(Counter);
