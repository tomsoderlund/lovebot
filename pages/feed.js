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
import LoadingSpinner from '../components/LoadingSpinner';

class FeedPage extends React.Component {

	static propTypes = {

		users: PropTypes.shape({
			loading: PropTypes.bool.isRequired,
			data: PropTypes.array.isRequired
		}).isRequired,

		dispatch: PropTypes.func.isRequired

	};

	static async getInitialProps ({store, isServer, pathname, query, req}) {
		const loggedInUser = isServer ? _.get(req, 'session.passport.user') : _.get(window, '__NEXT_DATA__.props.initialProps.loggedInUser');
		//console.log(`getInitialProps`, loggedInUser);
		// Get all Users
		const gender = 'woman';
		const users = await store.dispatch(reduxApi.actions.users.sync({ gender }));
		const relationIds = await store.dispatch(reduxApi.actions.relationIds({ userId: _.get(loggedInUser, '_id') }));
		return { users, loggedInUser, relationIds };
	}

	constructor (props) {
		super(props)
		this.state = { gender: 'woman', users: props.users, relationIds: props.relationIds, loggedInUser: props.loggedInUser, currentUserOpen: null }
	}

	handleFilterChange (property, event) {
		// Progress indicator
		let newFilter = _.merge({}, this.state);
		newFilter[property] = event.target.value;
		newFilter.inProgress = true;
		this.setState(newFilter);
		// Data request
		const callbackWhenDone = () => this.setState({ inProgress: null });
		this.props.dispatch(reduxApi.actions.users.reset('sync'));
		const query = _.pick(newFilter, ['gender', 'city']);
		this.props.dispatch(reduxApi.actions.users.sync(query, callbackWhenDone));
	}

	handleClickUser (userId) {
		this.setState({ currentUserOpen: userId });
	}

	handleUserAction (user, type) {
		const newRelation = {
			fromUser: this.props.loggedInUser._id,
			toUser: user._id,
			type
		};
		const newRelationIds = [user._id, ...this.state.relationIds.data];
		this.setState({ relationIds: { data: newRelationIds } });
		this.props.dispatch(reduxApi.actions.relations.post({}, { body: JSON.stringify(newRelation) }));
	}

	render () {

		const {users} = this.props;

		const userList = users.data
			? _(users.data).filter(user => !_.includes(this.state.relationIds.data, user._id)).map((user, index) => <UserItem
					user={user}
					index={index}
					key={index}
					inProgress={this.state.inProgress}
					isOpen={this.state.currentUserOpen === user._id}
					onClick={this.handleClickUser.bind(this)}
					hideActions={!this.props.loggedInUser}
					onAction={this.handleUserAction.bind(this)}
					isAdmin={this.props.loggedInUser.isAdmin}
				/>
			).value()
			: [];

		return <div>
			<PageHead
				title='Lovebot'
				description='A love-finding Twitter bot'
			/>

			<MenuBar loggedInUser={this.props.loggedInUser}></MenuBar>

			<main>

				<div className='options'>
					<select value={this.state.gender} onChange={this.handleFilterChange.bind(this, 'gender')} >
						<option value="woman">Women</option>
						<option value="man">Men</option>
						<option value="other">Other</option>
					</select>
					<select value={this.state.city} onChange={this.handleFilterChange.bind(this, 'city')} >
						<option value="all">All</option>
						<option>Stockholm</option>
					</select>
				</div>

				<LoadingSpinner hide={!this.state.inProgress}/>

				<div className={'userList ' + (this.state.inProgress ? 'hidden' : '')}>
					{userList}
				</div>
				<style jsx>{`
					div {
						margin-top: 1em;
					}
					.userList {
						display: flex;
						flex-direction: row;
						justify-content: center;
						align-items: flex-start;
						flex-wrap: wrap;						
					}
					.options {
						display: flex;
						flex-direction: row;
						justify-content: space-around;
						align-items: flex-start;
						width: 95vmin;
						//max-width: 15em;
					}
				`}</style>
			</main>

		</div>
	};

}

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (state, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), state);
const mapStateToProps = (state) => ({ users: state.users, relationIds: state.relationIds }); // use endpoints from reduxApi here

const FeedPageConnected = withRedux({ createStore: makeStore, mapStateToProps })(FeedPage)
export default FeedPageConnected;
