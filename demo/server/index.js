const express = require(`express`);
const app = express();

const fs = require(`fs`);

const Template7 = require(`../dist/template7.min.js`);

const tvShow = require(`./tv-show-server.js`);

// Helper to format dates
Template7.registerHelper('formatDate', function(date) {
  var months = ('January February March April May June July August September October November December').split(' ');
  var _date = new Date(date);
  var month = months[_date.getMonth()];
  var day = _date.getDate();
  var year = _date.getFullYear();
  var h = _date.getHours();
  h = h < 10 ? '0' + h : h;
  var m = _date.getMinutes();
  m = m < 10 ? '0' + m : m;
  return month + ' ' + day + ', ' + year + ' ' + h + ':' + m;
});

// load template
// note: synchronous is acceptable here because it is only called once at server load
// but: in other cases async would be much better
const template = fs.readFileSync(`test.html`, `utf8`);

// Compile and render
const compileStartTime = new Date().getTime(),
			compiled = Template7(template).compile(),
			compileEndTime = new Date().getTime(),
			compiledRendered = compiled(tvShow),
			compiledRenderedTime = new Date().getTime();

const html =
`
<!DOCTYPE html>
<html lang="en">
	<head>
    <meta charset="UTF-8">
    <title>Template7</title>
		<style>
			body {
					background: #000;
					margin: 0;
					padding: 0;
					position: relative;
					font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
					font-size: 14px;
					color:#444;
					line-height: 1.4;
			}
			#content-wrap {
					width: 960px;
					margin-left: auto;
					margin-right: auto;
			}
			#rendered-time {
					text-align: center;
					background: rgba(0, 255, 0, 0.3);
					color:#fff;
					padding: 10px 0;
					position: relative;
					z-index: 1;
			}
			#rendered-time span {
					display: inline-block;
					margin: 0 50px;
			}
			.bg {
					position: fixed;
					left: 0;
					top: 0;
					z-index: 0;
					width: 100%;
					height: 100%;
					opacity: 0.15;
			}
			.header {
					position: relative;
					height: 300px;
					background-size: cover;
					background-position: center top;
					color:#fff;
			}
			.header .gradient {
					position: absolute;
					left: 0%;
					top: 50%;
					width: 100%;
					height: 50%;
					background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.9));
			}
			.header .left {
					position: absolute;
					left: 40px;
					bottom: 20px;
					z-index: 10;
			}
			.header h1 {
					font-size: 35px;
					font-weight: 300;
					margin: 0;
					line-height: 1;
			}
			.header .props {
					list-style: none;
					margin: 0;
					padding: 0;
					position: absolute;
					right: 0;
					bottom: 0;
					width: 50%;
			}
			.header .props li {
					padding: 8px 10px 8px 10px;
					border-bottom: 1px solid rgba(255,255,255,0.2);
					float: left;
					width: 50%;
					box-sizing:border-box;
			}
			.header .props li:last-child {
					border-bottom: none;
			}
			.header .props li b {
					font-weight: 300;
			}
			.overview {
					position: relative;
					padding: 40px 40px;
					background: #fff;
			}
			p {
					margin: 1em 0;
			}
			.season {
					position: relative;
			}
			.season-title {
					color:#fff;
					font-size: 41px;
					font-weight: 300;
					padding-bottom: 5px;
					padding-left: 40px;
					padding-top: 20px;
					background: rgba(255,140,0,0.4);
			}
			.episode {
					background: #fff;
					padding: 20px 40px;
					margin-bottom: 2px;
					overflow: hidden;
					position: relative;
			}
			.episode .pic {
					float: left;
					width: 250px;
			}
			.episode .pic img {
					width: auto;
					height: auto;
					max-width: 100%;
			}
			.episode .info {
					margin-left: 280px;
			}
			.episode-title {
					font-size: 31px;
					font-weight: 300;
					color:#000;
			}
			.ratings {
					margin: 5px 0;
			}
			.ratings span {
					margin-right: 20px;
					font-size: 18px;
			}
			.date {
					color:#777;
			}
		</style>
	</head>
	<body>
		<div id="rendered-time">
			<span>Compilation: ${ (compileEndTime - compileStartTime) }ms</span>
			<span>Rendering: ${ (compiledRenderedTime - compileEndTime) }ms</span>
			<span>Compilation + Rendering: ${ (compiledRenderedTime - compileStartTime) }ms</span>
		</div>
		<div id="content-wrap">${ compiledRendered }</div>
	</body>
</html>
`;

app.get(`/`, function (req, res) {
	res.send(html);
});

app.listen(3000, function () {
  console.log(`Example app listening on port 3000!`);
});
