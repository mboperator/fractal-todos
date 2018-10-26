import React from 'react';
import { v4 } from 'uuid';
import { Button, Input, Box, FlexList } from '@procore/core-react';
import { withStateHandlers } from 'recompose';
import { types } from "mobx-state-tree"
import { observer } from "mobx-react"
import TodoItem, { Todo } from './SingleExample';

const post = (url, payload) => new Promise((resolve) =>
  setTimeout(() => {
    const mockResponse = { status: 200, body: { item: { ... payload, urls: { self: `${url}/${v4()}` }} } }
    console.log('post::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

const TodoListModel = types
  .model("TodoList", {
    id: types.identifier,
    name: types.string,
    todos: types.array(Todo),
  })

export const TodoList = TodoListModel.actions(list => ({
  addTodo: (todo) => {
    list.todos.push(todo)
  },
  removeTodo: (todo) => {
    list.todos.remove(todo)
  }
}))

const store = TodoList.create({
  id: v4(),
  name: '',
  todos: [],
});

export const TodoListView = ({ actions, list }) => (
  <Box padding="md">
    <FlexList direction="column">
      <h2>{list.name}</h2>
      <FormState>
        {({ title, description, update, clear }) => (
          <FlexList direction="column">
            <Input
              placeholder="Title"
              onChange={({ target }) => update('title', target.value)}
              defaultValue={title}
            />
            <Input
              placeholder="Description"
              onChange={({ target }) => update('description', target.value)}
              defaultValue={description}
            />
            <FlexList>
              <Button onClick={() => {
                actions.addTodo({ title, description });
                clear();
              }}>
                Add Todo
              </Button>
              <Button onClick={clear} variant="secondary">
                Clear
              </Button>
            </FlexList>
          </FlexList>
        )}
      </FormState>
      {list.todos.map(todo => (
        <TodoItem todo = {todo} key={todo.id} />
      ))}
    </FlexList>
  </Box>
)

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ title: '', description: '' }),
})(({ children, ...props }) => children(props));


const FCompose = observer(TodoListView);

export default ({ todoList = store })=> {
  const actions = {
    addTodo: todo => {
      todoList.addTodo(Todo.create({
        id: v4(),
        endpoint: `/todos/${v4()}`,
        ...todo
      }));
    },
    removeTodo: todo => todoList.removeTodo(todo),
  };

  return (
    <FCompose
      list={todoList}
      actions={actions}
    />
  )
}
