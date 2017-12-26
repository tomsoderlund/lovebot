import _ from 'lodash';

import { Component } from 'react';
import PropTypes from 'prop-types';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../lib/reduxApi';

import PageHead from '../components/PageHead';
import MenuBar from '../components/MenuBar';
import UserItem from '../components/UserItem';

class MatchesPage extends Component {

	static async getInitialProps ({store, isServer, query, req}) {
		// Get user
		const loggedInUser = isServer ? _.get(req, 'session.passport.user') : _.get(window, '__NEXT_DATA__.props.initialProps.loggedInUser');
		return { loggedInUser };
	}

	render() {

		return (
			<div>
				<PageHead
					title='Lovebot'
					description='A love-finding Twitter bot'
				/>

				<MenuBar loggedInUser={this.props.loggedInUser}></MenuBar>

				<main>
					Matches
				</main>

			</div>
		);
	}
};

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (state, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), state);
const mapStateToProps = (state) => ({ relations: state.relations });

const MatchesPageConnected = withRedux({ createStore: makeStore, mapStateToProps })(MatchesPage)
export default MatchesPageConnected;
