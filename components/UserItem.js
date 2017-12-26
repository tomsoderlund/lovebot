import _ from 'lodash';
import tinycolor from 'tinycolor2';

import IconButton from './IconButton'

const getColorByDate = date => {
	const ageInMinutes = (new Date() - new Date(date)) / (1000 * 60);
	const maxAge = 0.5 * 60;
	const mixLevel = Math.round(Math.min(1 * 100 * ageInMinutes / maxAge, 100));
	const newColor = tinycolor.mix('palegreen', 'white', mixLevel); // higher value = more white
	return newColor
}

const UserItem = ({user, index, inProgress, isOpen, hideActions, onClick, onAction}) => (
	<div
		className={'userCard' + (inProgress === user._id ? ' inProgress' : '') + (isOpen ? ' open' : '')}
		style={{ backgroundColor: getColorByDate(user.dateUpdated) }}
		onClick={onClick ? onClick.bind(undefined, user._id) : undefined}
	>
		
		<img className='portrait' src={user.imageUrl} alt={user.name} title={user.description} />
		<h3 className='name'>{user.name}</h3>
		<p className='twitterHandle'><a href={ 'https://twitter.com/' + user.twitterHandle } target='_blank'>@{user.twitterHandle}</a></p>
		<p className={'description collapsable ' + (isOpen ? 'open' : 'collapsed')}>{user.description}</p>
		<p className='location'>{_.get(user,'locationDetails.city',_.get(user,'locationDetails.original',user.location))}</p>
		
		<nav className={hideActions ? 'hidden' : ''}>
			<IconButton label='Ask out' icon='handshake' onClick={onAction ? onAction.bind(undefined, user, 'askdate') : undefined} />
			<IconButton label='Save' icon='star' onClick={onAction ? onAction.bind(undefined, user, 'favorite') : undefined} />
			<IconButton label='Pass' icon='thumbs-down' onClick={onAction ? onAction.bind(undefined, user, 'no') : undefined} />
		</nav>

		<style jsx>{`
			.userCard {
				width: 10em;
				margin: 0.5em;
				padding: 1em;
				border-radius: 0.2em;
				//border: 1px solid #e6e6e6;
				box-shadow: 0 2px 2px rgba(0,0,0, 0.4);
				width: 95vmin;
				max-width: 15em;
				/* Flexbox: */
				display: inline-flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
			.userCard:hover {
				opacity: 0.8;
			}
			.userCard.open {
				background-color: #fffcdc !important;
			}
			.userCard p {
				font-size: 0.8em;
				color: gray;
				margin: 0.2em 0;
			}
			.userCard a {
				text-decoration: none;
				color: inherit;
			}
			.portrait {
				width: 6em;
				height: 6em;
				background: #eee;
				border-radius: 50%;
				border: 1px solid #d5d5d5;
			}
			.twitterHandle {
			}
			.inProgress {
				opacity: 0.3;
			}
			nav {
				background-color: rgba(0,0,0, 0.5);
				width: 95vmin;
				max-width: 15em;
				margin-top: 1em;
				margin-bottom: -1em;
				display: inline-flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
			}
		`}</style>
	</div>
);
export default UserItem;
