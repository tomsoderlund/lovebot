import _ from 'lodash';
import tinycolor from 'tinycolor2';

const getColorByDate = date => {
	const ageInMinutes = (new Date() - new Date(date)) / (1000 * 60);
	const maxAge = 0.5 * 60;
	const mixLevel = Math.round(Math.min(100 * ageInMinutes / maxAge, 100));
	const newColor = tinycolor.mix('lime', 'white', mixLevel);
	return newColor
}

const UserItem = ({user, index, inProgress, handleUpdate, handleDelete}) => (
	<div
		className={'user' + (inProgress === user._id ? ' inProgress' : '')}
		style={{ backgroundColor: getColorByDate(user.dateUpdated) }}
	>
		<a href={ 'https://twitter.com/' + user.twitterHandle } target='_blank'>
			<img className='portrait' src={user.imageUrl} alt={user.name}/>
			<h3 className='name'>{user.name}</h3>
			<p className='twitterHandle'>@{user.twitterHandle}</p>
			<p className='location'>{_.get(user,'locationDetails.city',user.location)}</p>
		</a>
		<button>I’m interested</button>

		<style jsx>{`
			.user {
				border: 1px solid gray;
				width: 10em;
				margin: 0.2em;
				padding: 0.2em;
				/* Flexbox: */
				display: inline-flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
			.user p {
				font-size: 0.8em;
				color: gray;
			}
			.user > a {
				text-decoration: none;
				/* Flexbox: */
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
			.user > a:hover {
				text-decoration: underline;
				opacity: 0.8;
			}
			.portrait {
				width: 6em;
				height: 6em;
				background: #eee;
				border-radius: 50%;
			}
			.twitterHandle {
			}
			.inProgress {
				opacity: 0.3;
			}
		`}</style>
	</div>
);
export default UserItem;