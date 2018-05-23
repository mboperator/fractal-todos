import { bindActionCreators } from 'redux';

const ChildConnect = ({ meta: metaProp, dispatch, actions, children }) => {
  const decoratedDispatch = (payload, meta = {}) => dispatch({ action: payload }, { ...meta, ...metaProp });
  const decoratedActions = bindActionCreators(actions, decoratedDispatch);

  return children(decoratedActions);
};


export default ChildConnect;
