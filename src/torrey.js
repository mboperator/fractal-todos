import React from 'react';
import PropTypes from 'prop-types';
import Connect from './Connect';
import ChildConnect from './ChildConnect';
import { lifecycle, withStateHandlers, getContext } from 'recompose';
import { equals } from 'ramda';

const Lifecycle = lifecycle({
  componentDidMount() {
    this.props.onMount && this.props.onMount();
  },
})(({ children }) => children);

const Root = React.createContext({ dispatch: () => ({}), path: [] });

const T = {
  Root: withStateHandlers(
    ({ model }) => ({ path: [model.name] }),
    {
      updatePath: ({ path, leaves }) => newPath => ({ path: path.concat(newPath) }),
    }
  )(({ model, children, updatePath, path }) => {
    return (
      <Root.Provider value={{ dispatch: model.actions.updateInPath, path, updatePath }}>
        <Connect selector={s => s} actions={model.actions}>
          {children}
        </Connect>
      </Root.Provider>
    )
  }),
  Leaf: getContext(
   { store: PropTypes.object }
  )(({ store, path, model, children }) => (
    <ChildConnect 
      meta={{ path }} 
      dispatch={action =>{ 
        debugger;
        store.dispatch({ ...action, path });
      }}
      actions={model.actions}
    >
      {children}
    </ChildConnect>
  )),
};

export default T;
