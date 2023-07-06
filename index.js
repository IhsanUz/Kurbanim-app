const express = require('express');
const session = require('express-session')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/kurbanim');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const User = mongoose.model('users', UserSchema);

const ListingSchema = new mongoose.Schema({
    age: {
        type: Number,
        index: true,
        required: true,
        min: 1,
        max: 3,
    },
    breed: {
        type: String,
    },
    description: String,
    sellerId: String,
    sellerName: String,
    status: Number,
    city: String,
    createdAt: Date,
    deleted: Boolean,
});
const Listing = mongoose.model('listings', ListingSchema);
const ages = [1, 2, 3];
const breeds = ["Koç", "Koyun", "Dana", "Deve"];
const cities = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Amasya",
    "Ankara",
    "Antalya",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakir",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkari",
    "Hatay",
    "Isparta",
    "Mersin",
    "İstanbul",
    "İzmir",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kırklareli",
    "Kırşehir",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Kahramanmaraş",
    "Mardin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Şanlıurfa",
    "Uşak",
    "Van",
    "Yozgat",
    "Zonguldak",
    "Aksaray",
    "Bayburt",
    "Karaman",
    "Kırıkkale",
    "Batman",
    "Şırnak",
    "Bartın",
    "Ardahan",
    "Iğdır",
    "Yalova",
    "Karabük",
    "Kilis",
    "Osmaniye",
    "Düzce"
]
const app = express();

app.set('view engine', 'twig')
app.set('views', './views');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 604800000 }
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});
app.get('/json', async(req, res, next) => {
    const listings = await Listing.find({});
    res.json(listings)
})
app.get('/', async(req, res, next) => {
    const listings = await Listing.find({});

    res.render('index', { listings: listings })
})

app.get('/register', (req, res, next) => res.render('register'))

app.get('/login', (req, res, next) => {
    if (req.session.user) {
        res.redirect("/");
        return
    }
    res.render('login')
})

app.get('/logout', (req, res, next) => {
    if (req.session.user)
        req.session.destroy();
    res.redirect('/login');
})

app.get('/listings/editor', (req, res, next) => {
    if (req.session.user) {
        res.render('listingEditor', { cities: cities, ages: ages, breeds: breeds });
    } else {
        res.redirect('/login');
    }
})
app.post('/register', async(req, res, next) => {
    if (!req.body.username || !req.body.password || !req.body.password2) {
        res.render('register', { error: "Tüm gerekli alanları doldurunuz." });
        return;
    }
    for (let p in req.body) {
        if (req.body[p].trim().length == 0) {
            res.render('register', { error: "Alan boş bırakılamaz" + p });
            return;
        }
    }
    if (req.body.password !== req.body.password2) {
        res.render('register', { error: "Parolalar uyuşmuyor." });
        return;
    }
    if (await User.findOne({ username: req.body.username }) !== null) {
        res.render('register', { error: "Kullanıcı zaten mevcut." });
        return;
    }
    let user = {
        username: req.body.username,
        password: req.body.password
    }
    user = await User.create(user);
    req.session.user = user;
    res.redirect('/', );
})

app.post('/login', async(req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.render('login', { error: "Tüm gerekli alanları doldurunuz." });
        return;
    }
    for (let p in req.body) {
        if (req.body[p].trim().length == 0) {
            res.render('login', { error: "Alan boş bırakılamaz" + p });
            return;
        }
    }

    let user = await User.findOne({ username: req.body.username });
    if (user === null) {
        res.render('login', { error: "Kullanıcı bulunamadı!" });
        return;
    }

    if (user.password !== req.body.password) {
        res.render('login', { error: "Hatalı Parola!" });
        return;
    }

    req.session.user = user;
    res.redirect('/');
});
app.post('/listings/editor', async(req, res, next) => {

    if (req.session.user == null) {
        res.redirect('/login');
        return;
    }

    if (ages.includes(req.body.age * 1) === false) {
        res.render('listingEditor', { cities: cities, ages: ages, breeds: breeds, success: false, error: "Hatalı Yaş" })
        return;
    }
    if (cities.includes(req.body.city) === false) {
        res.render('listingEditor', { cities: cities, ages: ages, breeds: breeds, success: false, error: "Hatalı Şehir" })
        return;
    }
    if (breeds.includes(req.body.breed) === false) {
        res.render('listingEditor', { cities: cities, ages: ages, breeds: breeds, success: false, error: "Hatalı Tür" })
        return;
    }

    if (!(req.body.description && req.body.description.trim().length > 0)) {
        res.render('listingEditor', { cities: cities, ages: ages, breeds: breeds, success: false, error: "Hatalı Açıklama" })
        return;
    }

    let listing = new Listing(req.body);
    listing.status = 0;
    listing.createdAt = Date.now();
    listing.deleted = false;
    listing.sellerId = req.session.user._id;
    listing.sellerName = req.session.user.username;
    await listing.save();
    res.redirect("/")
});

app.listen(3000);