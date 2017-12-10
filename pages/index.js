import fetch from 'isomorphic-unfetch'

import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import reduxApi from '../lib/reduxApi'; // our redux-rest object
import { connectComponentWithStore } from '../lib/reduxApi';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(reduxApi.reducers);
const store = createStoreWithMiddleware(reducer);

const mapStateToProps = (state) => ({ users: state.users });

import PageHead from '../components/PageHead';
import UserItem from '../components/UserItem';

class IndexPage extends React.Component {

	static propTypes = {

		// oneUser: PropTypes.shape({
		// 	loading: PropTypes.bool.isRequired,
		// 	data: PropTypes.shape({
		// 		text: PropTypes.string
		// 	}).isRequired
		// }).isRequired,

		users: PropTypes.shape({
			loading: PropTypes.bool.isRequired,
			data: PropTypes.array.isRequired
		}).isRequired,

		dispatch: PropTypes.func.isRequired

	};

	constructor (props) {
		super(props)
		this.state = { twitterHandle: '', users: props.users }
	}

	handleChange (event) {
		this.setState({ twitterHandle: event.target.value });
	}

	componentDidMount() {
		const {dispatch} = this.props;

		// Specify id for GET: /api/users/59c9743888a7e95e93c3bbea
		//dispatch(reduxApi.actions.oneUser({ id: '59c9743888a7e95e93c3bbea' }));

		// Fetch all /api/users
		dispatch(reduxApi.actions.users.sync());
	}

	handleAdd (event) {
		// Progress indicator
		this.setState({ inProgress: true });
		const callbackWhenDone = () => this.setState({ twitterHandle: '', inProgress: null });

		// Actual data request
		const newUser = {
			twitterHandle: this.state.twitterHandle,
		};
		this.props.dispatch(reduxApi.actions.users.post({}, { body: JSON.stringify(newUser) }, callbackWhenDone));
	}

	handleUpdate (index, userId, event) {
		// Progress indicator
		this.setState({ inProgress: userId });
		const callbackWhenDone = () => this.setState({ inProgress: null });

		// Actual data request
		const newUser = {
			twitterHandle: prompt('New twitterHandle?'),
		};
		this.props.dispatch(reduxApi.actions.users.put({ id: userId }, { body: JSON.stringify(newUser) }, callbackWhenDone));
	}

	handleDelete (index, userId, event) {
		// Progress indicator
		this.setState({ inProgress: userId });
		const callbackWhenDone = () => this.setState({ inProgress: null });

		// Actual data request
		this.props.dispatch(reduxApi.actions.users.delete({ id: userId }, callbackWhenDone));
	}

	render () {

		const {users} = this.props;

		const userList = users.data
			? users.data.map((user, index) => <UserItem
					user={user}
					index={index}
					key={index}
					inProgress={this.state.inProgress}
					handleUpdate={this.handleUpdate.bind(this)}
					handleDelete={this.handleDelete.bind(this)}
				/>)
			: [];

		return <div>
			<PageHead
				title='Lovebot'
				description='A love-finding Twitter bot'
			/>

			<div className='options'>
				<input type='checkbox'/>Only people
			</div>

			<div className='userList'>
				{userList}
			</div>

			<style jsx>{`
				div {
					margin-top: 1em;
				}
				.userList {
					/* Flexbox: */
					display: flex;
					flex-direction: row;
					justify-content: center;
					align-items: flex-start;
					flex-wrap: wrap;						
				}
			`}</style>

		</div>
	};

}

const IndexPageConnected = connectComponentWithStore(IndexPage, store, mapStateToProps);
export default IndexPageConnected;
