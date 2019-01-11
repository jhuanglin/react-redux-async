const mockData = (state={}, action) => {
  switch(action.type) {
    case 'RECEIVE_DATA_SUCCESSED':
      return Object.assign({}, state, {
        data: action.data
      })
    default:
      return state
  }
}

export default mockData
