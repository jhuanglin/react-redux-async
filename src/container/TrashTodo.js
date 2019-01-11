import TodoList from '../components/TodoList'
import { connect } from 'react-redux'
import { backTodo } from '../actions'

const mapStateToProps = state => ({
  todos: state.todos.filter(t => t.del)
})

const mapDispatchToProps = dispacth => ({
  handleTodo: id => dispacth(backTodo(id))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
