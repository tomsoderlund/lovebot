import _ from 'lodash';

import { Component } from 'react';
import PropTypes from 'prop-types';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../lib/reduxApi';

import Link from 'next/link'

import PageHead from '../components/PageHead';
import MenuBar from '../components/MenuBar';
import UserItem from '../components/UserItem';

class MatchesPage extends Component {

	static async getInitialProps ({store, isServer, query, req}) {
		// Get user
		const loggedInUser = isServer ? _.get(req, 'session.passport.user') : _.get(window, '__NEXT_DATA__.props.initialProps.loggedInUser');
		const relations = await store.dispatch(reduxApi.actions.relations.sync({ fromUser: loggedInUser._id }));
		return { loggedInUser, relations };
	}

	constructor (props) {
		super(props)
		this.state = { currentUserOpen: null }
	}

	handleClickUser (userId) {
		this.setState({ currentUserOpen: userId });
	}

	handleUserAction (userId) {
		this.setState({ currentUserOpen: userId });
	}

	render() {

		console.log(`relations`, this.props);

		const relationsAskDate = this.props.relations.data
			? _(this.props.relations.data).filter(relation => relation.type === 'askdate').map((relation, index) => <UserItem
					user={relation.toUser}
					key={relation.toUser._id}
					isOpen={this.state.currentUserOpen === relation.toUser._id}
					onClick={this.handleClickUser.bind(this)}
					onAction={this.handleUserAction.bind(this)}
				/>
			).value()
			: [];

		const relationsSaved = this.props.relations.data
			? _(this.props.relations.data).filter(relation => relation.type === 'favorite').map((relation, index) => <UserItem
					user={relation.toUser}
					key={relation.toUser._id}
					isOpen={this.state.currentUserOpen === relation.toUser._id}
					onClick={this.handleClickUser.bind(this)}
					onAction={this.handleUserAction.bind(this)}
				/>
			).value()
			: [];

		const relationsNo = this.props.relations.data
			? _(this.props.relations.data).filter(relation => relation.type === 'no').map((relation, index) => <Link href={`/profile?username=${relation.toUser.twitterHandle}`} as={`/profile/${relation.toUser.twitterHandle}`}>
					<a>{relation.toUser.name} (@{relation.toUser.twitterHandle})</a>
				</Link>
			).value()
			: [];

		return (
			<div>
				<PageHead
					title='Lovebot'
					description='A love-finding Twitter bot'
				/>

				<MenuBar loggedInUser={this.props.loggedInUser}></MenuBar>

				<main>
					<h2>Dates</h2>
					{relationsAskDate}

					<h2>Saved</h2>
					{relationsSaved}

					<h2>Passed on</h2>
					{relationsNo}

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
