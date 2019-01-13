const path = require( 'path' );
const express = require('express');
const Twig = require("twig");

let openPage = function() {
	let url = 'http://localhost:3000';
	let start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
	require( 'child_process' ).exec( start + ' ' + url );
};

const pages = [
	{ url: '/index', template: 'pages/index.rain', layout: 'custom.rain' },
	{ url: '/product', template: 'pages/product.rain', layout: 'custom.rain' },
	{ url: '/collection', template: 'pages/collection.rain', layout: 'custom.rain' },
	{ url: '/catalog', template: 'pages/catalog.rain', layout: 'custom.rain' },
	{ url: '/search', template: 'pages/collection.rain', layout: 'custom.rain' },
	{ url: '/brands', template: 'pages/brands.rain', layout: 'custom.rain' },
	{ url: '/textpage', template: 'pages/textpage.rain', layout: 'custom.rain' },
	{ url: '/tags', template: 'pages/tags.rain', layout: 'custom.rain' },
	{ url: '/blog', template: 'pages/blog.rain', layout: 'custom.rain' },
	{ url: '/article', template: 'pages/article.rain', layout: 'custom.rain' },
	{ url: '/cart', template: 'pages/cart.rain', layout: 'custom.rain' },
	{ url: '/checkout/default', template: 'pages/checkouts/default.rain', layout: 'fixed.rain' },
	{ url: '/checkout/default/details', template: 'pages/checkouts/default.rain', layout: 'fixed.rain' },
	{ url: '/checkout/default/shipping', template: 'pages/checkouts/default.rain', layout: 'fixed.rain' },
	{ url: '/checkout/default/shipment', template: 'pages/checkouts/default.rain', layout: 'fixed.rain' },
	{ url: '/checkout/default/payment', template: 'pages/checkouts/default.rain', layout: 'fixed.rain' },
	{ url: '/checkout/default/review', template: 'pages/checkouts/default.rain', layout: 'fixed.rain' },
	{ url: '/thankyou', template: 'pages/thankyou.rain', layout: 'custom.rain' },
];

module.exports = function( args, options ) {
	let app = express();

	Twig.cache( false );
	Twig.extendFilter("url_asset", (value) => value.split(" ").reverse().join(" ") );
	Twig.extendFilter("url_core", (value) => value.split(" ").reverse().join(" ") );

	app.set( 'views', path.join( process.cwd(), './views/' ) );
	app.set( 'view cache', false );
	app.set( 'view engine', Twig.__express );
	app.engine( 'rain', Twig.__express );

	app.get( '/', function ( req, res ) {
		return res.send(`<ul>${ pages.map( page => `<li><a href="${page.url}">${page.url}</a></li>` ).join(``) }</ul>`);
	} );

	for ( let i in pages ) {
		let page = pages[i];

		app.get( page.url, function ( req, res ) {
			let config = require( '../util/config' ).get(),
				context = config.contexts[ (page.url.substring(0,1) === '/' ? page.url.substring(1, page.url.length) : url).replace('/', '_') ];

			context.template = page.template;

			try {
				res.render( path.join( process.cwd(), config.paths.layouts, page.layout ), context );

			} catch( e ) {
				return res.send(`error`);
			}
		} );
	}

	app.listen( 3000 );

	openPage();
};