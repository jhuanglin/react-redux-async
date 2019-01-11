import { combineReducers } from 'redux'
import mockData from './mockData'
import todos from './todos'
import requestStatus from './requestStatus'

const createReducer = asyncReducers => {
  return combineReducers({
    todos,
    mockData,
    requestStatus,
    ...asyncReducers
  })
}

export const injectReducers = (store, key, asyncReducers) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = asyncReducers
  store.replaceRecuer(createReducer(store.asyncReducers[key]))
}

export default createReducer
