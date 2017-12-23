// Class/extends
import { Component } from 'react';

import Link from 'next/link'

export default class MenuBar extends Component {
	render() {
		return (
			<nav>
				<a href='/login/twitter' className={this.props.loggedInUser ? 'hidden' : ''}>Login</a>
				<Link href='/editprofile' as='/me'><a className={!this.props.loggedInUser ? 'hidden' : ''}>Me</a></Link>
				<h2>Lovebot</h2>
				<Link href='/matches' as='/matches'><a>My matches</a></Link>
				<style jsx>{`
					nav {
						display: flex;
						flex-direction: row;
						justify-content: space-around;
						align-items: center;

						position: fixed;
						width: 100%;
						top: 0;
						z-index: 100;

						background-color: #be59a0;
						color: white;
					}
					a {
						color: inherit;
						text-decoration: none;
					}
				`}</style>
			</nav>
		);
	}
};