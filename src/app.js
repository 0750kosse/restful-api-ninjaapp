const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const handlebars = exphbs.create({
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  defaultLayout: 'main',
  extname: 'handlebars'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views/partials'));



const port = 3000;

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => res.render("home"));


app.listen(port, () => console.log(`app listening on port ${port}`));
