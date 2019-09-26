import { createSelector } from 'reselect'

const getTodo = state => state.todos

export const getBackTodo = createSelector(
  [getTodo],
  function(todos) {
    const tds = JSON.parse(JSON.stringify(todos))
    var a = tds.map(t => {t.text += 'll'; return t})
    return a
  }
)
