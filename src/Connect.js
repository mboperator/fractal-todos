import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const Connect = ({ selector = () => ({}), actions, children }) => {
  const Connected = connect(
    selector,
    dispatch => ({ actions: bindActionCreators(actions, dispatch) })
  )(props => children(props))

  return <Connected />
}


export default Connect
