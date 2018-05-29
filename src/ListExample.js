import React from 'react';
import { v4 } from 'uuid';
import { Button, Input, Card, Box, FlexList } from '@procore/core-react';
import { withStateHandlers } from 'recompose';
import { createStore } from 'redux';
import { createModule } from 'redux-modules';
import { Provider } from 'react-redux';

import { itemModel, TodoItem } from './SingleExample';
import Connect from './Connect';
import ChildConnect from './ChildConnect';
import T from './torrey';
import { lensPath, set, view } from 'ramda';

const getIn = path => input => view(lensPath(path), input);
const setIn = (path, value) => input => set(lensPath(path), value)(input);

const pathReducer = (childModels) => (state, action) => {
  if (action.path) {
    const [pathToFetch, ...remainingPath] = action.path;
    const slice = getIn(pathToFetch)(state);
    const childModel = childModels.find(child => child.name === pathToFetch[0]);
    const updatedSlice = childModel.reducer(slice, { ...action, path: remainingPath });
    return setIn(pathToFetch, updatedSlice)(state);
  }
  return state;
};

export const todoListModel = createModule({
  name: 'todoList',
  initialState: {
    id: v4(),
    name: '',
    todos: [],
  },
  composes: [
    pathReducer([itemModel]),
  ],
  transformations: {
    init: s => s,
    addTodo: ({ todos, ...state }, { payload: todo }) => ({ todos: todos.concat({ ...todo, id: v4() }), ...state }),
    removeTodo: ({ todos, ...state }, { payload: id }) => ({ todos: todos.filter(t => t.id !== id), ...state }),
    updateTodo: ({ todos, ...state }, { payload, meta }) => {
      const todoToUpdate = todos.find(todos => todos.id === meta.id);
      const updatedTodo = itemModel.reducer(todoToUpdate, payload.action);
      const updatedState = {
        todos: todos.map(t => t.id === meta.id ? updatedTodo : t),
        ...state
      };
      return updatedState;
    },
  },
});

const store = createStore(todoListModel.reducer, { todos: [] });

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
        <T.Leaf dispatch={actions.updateTodo} model={itemModel} path={['todos', todo.id]}>
          {childActions => (
            <TodoItem {...todo} actions={childActions} />
          )}
        </T.Leaf>
      ))}
    </FlexList>
  </Box>
)

const FormState = withStateHandlers({}, {
  update: (state) => (attr, value) => ({ ...state, [attr]: value }),
  clear: () => () => ({ title: '', description: '' }),
})(({ children, ...props }) => children(props));

const ListExample = () => (
  <Provider store={store}>
    <T.Root model={todoListModel}>
      {({ actions, ...state }) => (
        <TodoList actions={actions} {...state} />
      )}
    </T.Root>
  </Provider>
);

export default ListExample;
