import Head from 'next/head'

const PageHead = ({title, description}) => (
	<Head>
		<title>{title}</title>
		<meta name='description' content={description}/>
		<meta charSet='utf-8'/>
		<meta httpEquiv='content-language' content='en'/>
		<meta name='viewport' content='initial-scale=1.0, width=device-width'/>
		<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
		<link rel='stylesheet' href='/static/app.css'/>
		<link rel='stylesheet' href='/static/css/fontawesome.css'/>
		<link rel='stylesheet' href='/static/css/fa-regular.css'/>
	</Head>
);
export default PageHead;
