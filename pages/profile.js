import _ from 'lodash';

import { Component } from 'react';
import PropTypes from 'prop-types';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../lib/reduxApi';

import PageHead from '../components/PageHead';
import MenuBar from '../components/MenuBar';
import UserCard from '../components/UserCard';

class ProfilePage extends Component {

	static async getInitialProps ({store, isServer, query, req}) {
		// Get user
		const loggedInUser = isServer ? _.get(req, 'session.passport.user') : _.get(window, '__NEXT_DATA__.props.initialProps.loggedInUser');
		const profileUsername = query.username || loggedInUser.twitterHandle;
		const isMe = profileUsername === loggedInUser.twitterHandle;
		const oneUserByName = await store.dispatch(reduxApi.actions.oneUserByName({ username: profileUsername }));
		return { oneUserByName, profileUsername, loggedInUser, isMe };
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
					<UserCard
						user={this.props.oneUserByName.data}
						isOpen={true}
						hideActions={true}
					/>

					<a href='/logout' className={this.props.isMe ? '' : 'hidden'}>Log out</a>
				</main>

			</div>
		);
	}
};

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (state, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), state);
const mapStateToProps = (state) => ({ oneUserByName: state.oneUserByName });

const ProfilePageConnected = withRedux({ createStore: makeStore, mapStateToProps })(ProfilePage)
export default ProfilePageConnected;
