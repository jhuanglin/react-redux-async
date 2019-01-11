import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import monitorReducer from '../enhancers/monitorReducer'

// import reducers from '../reducers'

import createReducer from '../reducers'

const configStore = (preloadState) => {
  const composeEnhancer = compose

  const middleware = [thunk]
  const middleWareEnhancers = applyMiddleware(...middleware)

  const enhancers = [monitorReducer]

  // chrome redux extension
  const reduxExtension = window.__REDUX_DEVTOOLS_EXTENSION && window.__REDUX_DEVTOOLS_EXTENSION()
  if (reduxExtension) {
    enhancers.push(reduxExtension)
  }

  const store = createStore(
    createReducer(),
    preloadState,
    composeEnhancer(
      middleWareEnhancers,
      ...enhancers
    )
  )

  store.asyncReducers = {}

  // reducers的热加载
  if (module.hot) {
    module.hot.accept(
      '../reducers',
      () => {
        return store.replaceReducer(createReducer(store.asyncReducers))
      }
    )
  }
  return store
}

export default configStore
