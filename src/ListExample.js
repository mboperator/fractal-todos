import React from 'react';
import { v4 } from 'uuid';
import { lifecycle } from 'recompose';
import { Button, Input, Card, Box, FlexList } from '@procore/core-react';
import { withStateHandlers } from 'recompose';
import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { install, Cmd, loop, liftState } from 'redux-loop';
import { Provider } from 'react-redux';

import { itemModel, TodoItem } from './SingleExample';
import Connect from './Connect';
import ChildConnect from './ChildConnect';

const post = (url, payload) => new Promise((resolve) =>
  setTimeout(() => {
    const mockResponse = { status: 200, body: { item: { ... payload, urls: { self: `${url}/${v4()}` }} } }
    console.log('post::', url, mockResponse)
    resolve(mockResponse)
  }, 500)
)

export const todoListModel = createModule({
  name: 'todoList',
  initialState: {
    id: v4(),
    name: '',
    todos: [],
  },
  composes: [liftState],
  transformations: {
    init: (state, { payload }) => ({ ...state, urls: { todos: payload.endpoint } }),
    addTodo: ({ todos, ...state }, { payload: todo }) => {
      const id = `optimistic-${v4()}`
      return [
        // Optimistic Update
        { todos: todos.concat({ ...todo, id }), ...state },
        Cmd.run(post, {
          args: [state.urls.todos, todo],
          // Update the optimistic version of the added todo item
          successActionCreator: response =>
            todoListModel.actions.updateTodo({ action: itemModel.actions.init(response.body.item) }, { id }),
          failActionCreator: todoListModel.actions.addTodoFail,
        })
      ]
    },
    addTodoFail: (state, { payload: error }) => state,
    removeTodo: ({ todos, ...state }, { payload: id }) => [
      ({ todos: todos.filter(t => t.id !== id), ...state }),
      Cmd.action(todoListModel.updateTodo(itemModel.actions.destroy(), { id }))
    ],
    updateTodo: ({ todos, ...state }, { payload, meta }) => {
      const todoToUpdate = todos.find(todos => todos.id === meta.id);
      const [updatedTodo, todoEffects] = itemModel.reducer(todoToUpdate, payload.action);
      const updatedState = {
        todos: todos.map(t => t.id === meta.id ? updatedTodo : t),
        ...state
      };
      return loop(
        updatedState,
        Cmd.map(todoEffects, action => todoListModel.actions.updateTodo({ action }, { id: meta.id }))
      );
    },
  },
});

const store = createStore(todoListModel.reducer, { todos: [] }, install());

export const TodoList = ({ name, actions, todos }) => (
  <Box padding="md">
    <FlexList direction="column">
      <h2>{name}</h2>
      <FormState>
        {({ title, description, update, clear }) => (
          <FlexList direction="column">
            <Input
              placeholder="Title"
              onChange={({ target }) => update('title', target.value)}
              value={title}
            />
            <Input
              placeholder="Description"
              onChange={({ target }) => update('description', target.value)}
              value={description}
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
      {todos.map(todo => (
        <ChildConnect actions={itemModel.actions} dispatch={actions.updateTodo} meta={{ id: todo.id }}>
          {childActions => (
            <TodoItem {...todo} actions={childActions} />
          )}
        </ChildConnect>
      ))}
    </FlexList>
  </Box>
)

const StandaloneTodoList = lifecycle({
  componentWillMount() {
    this.props.actions.init({ endpoint: 'todos' })
  }
})(TodoList)

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ title: '', description: '' }),
})(({ children, ...props }) => children(props));

const ListExample = () => (
  <Provider store={store}>
    <Connect selector={s => s} actions={todoListModel.actions}>
      {({ actions, ...state }) => (
        <StandaloneTodoList actions={actions} {...state} />
      )}
    </Connect>
  </Provider>
);

export default ListExample;
