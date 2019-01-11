const todos = (state=[], action) => {
  switch(action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          del: action.del
        }
      ]
    case 'DEL_TODO':
      return state.map(todo =>
        todo.id === action.id
          ? {...todo, del: !todo.del}
          : todo
      )
    case 'BACK_TODO':
        return state.map(todo =>
          todo.id === action.id
            ? {...todo, del: !todo.del}
            : todo
        )
    default:
      return state
  }
}

export default todos
