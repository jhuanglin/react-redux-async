const requestStatus = (state=false, action) => {
  switch(action.type) {
    case 'REQUEST_START':
    case 'REQUEST_END':
      return action.sub
    default:
      return state
  }
}

export default requestStatus
