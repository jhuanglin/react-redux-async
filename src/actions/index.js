let nextTodoId = 0
export const addTodo = text => ({
  type: 'ADD_TODO',
  id: nextTodoId++,
  del: false,
  text
})

export const delTodo = id => ({
  type: 'DEL_TODO',
  id
})

export const backTodo = id => ({
  type: 'BACK_TODO',
  id
})

export const requestFetchStart = sub => ({
  type: 'REQUEST_START',
  sub
})

export const requestFetchEnd = sub => ({
  type: 'REQUEST_END',
  sub
})

export const reciveData = data => ({
  type: 'RECEIVE_DATA_SUCCESSED',
  data
})

export function fetchMockData() {
  return function (dispatch) {
    dispatch(requestFetchStart(true))
    return new Promise((resolve) => {
      resolve()
    }).then(() => {
      const data = require('../mock').mockData
      console.log(data)
      dispatch(reciveData(data))
      dispatch(requestFetchEnd(false))
    })
  }
}
