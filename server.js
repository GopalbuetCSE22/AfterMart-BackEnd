const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.AFTERMART_PROJECT_URL
const supabaseKey = process.env.AFTERMART_API
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
    const { name, email, phone, password, division, district, ward, area } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);


    let addressId;

    // try to insert division, district, ward, area to the address table
    try {
        const { data, error } = await supabase
            .from('address')
            .insert([{ division, district, ward, area }])
            .select('address_id')
            .single();

        addressId = data.address_id;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get or create address' });
    }

    // try to do the insertion of the User table 
    try {
        // Insert user into Supabase
        const { data, error } = await supabase
            .from('User')
            .insert([{ name, email, phone, password: hashedPassword, address_id: addressId, house_and_road: district }]);

        if (error) {
            if (error.code === '23505' || error.message.includes('duplicate')) {
                return res.status(409).json({ message: 'User already exists' });
            }
            throw error;
        }
        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/delivaryServiceRegister', async (req, res) => {
    const { companyName, tradeLicense, division, district, ward, area } = req.body;

    let addressID;

    try {
        const { data, error } = await supabase
            .from('address')
            .insert([{ division, district, ward, area }])
            .select('address_id')
            .single();

        addressID = data.address_id;
    } catch (error) {
        console.log("error");
        return res.status(500).json({ error: 'Failed to get or create address' });
    }

    try {
        const { data, error } = await supabase
            .from('delivery_service')
            .insert([{
                company_name: companyName,
                trade_license: tradeLicense,
                company_address: addressID
            }]);
        if (error) {
            if (error.code === '23505' || error.message.includes('duplicate')) {
                return res.status(409).json({ message: 'tradeLicence already exists' });
            }
            throw error;
        }
        res.status(200).json({ message: 'DelivaryService registered successfully, wait for the Verification' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})





// All login post requestes
const SECRET_KEY = "PASSword"; // Use a strong secret in production

app.post('/userlogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user by email
        const { data: user, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.user_id, email: user.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/adminlogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user by email
        const { data: admin, error } = await supabase
            .from('admin')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = password === admin.password
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: admin.user_id, email: admin.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/delivaryServicelogin', async (req, res) => {
    const { companyName, tradeLicense } = req.body;

    try {
        // Fetch user by email
        const { data: delivaryCompany, error } = await supabase
            .from('delivery_service')
            .select('*')
            .eq('company_name', companyName)
            .eq('trade_license', tradeLicense)
            .single();

        if (error || !delivaryCompany) {
            return res.status(401).json({ message: 'Invalid Company or tradeLicense' });
        }

        const token = jwt.sign(
            { id: delivaryCompany.company_id, company_name: delivaryCompany.company_name },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Token authentication middleware (no change needed)


// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) return res.status(401).send("Access denied");

//     jwt.verify(token, SECRET_KEY, (err, user) => {
//         if (err) return res.status(403).send("Invalid token");
//         req.user = user;
//         next();
//     });
// };

app.get('/', (req, res) => {
    res.send('API is running');
});


app.get('/showDeliveryCompanyToVerify', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('delivery_service')
            .select('*')
            .eq('isverified', false);
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch delivery companies' });
        }

        res.status(200).json(data);
    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch delivery companies' });
        }
        res.status(200).json(data);
    }
})

app.patch('/verifyDeliveryCompany/:id', async (req, res) => {
    const companyId = req.params.id;
    try {
        const { data, error } = await supabase
            .from('delivery_service')
            .update({ isverified: true })
            .eq('company_id', companyId);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to verify company' });
        }
        res.status(200).json({ message: 'Company verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/showProductsToApprove', async (req, res) => {

})

app.get('/showUsersToVerify', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('isverified', false)
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch unverified users' });
        }

        res.status(200).json(data);

    } catch (error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch unverified users' });
        }

        res.status(200).json(data);
    }
})
app.patch('/verifyDeliveryCompany/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const { data, error } = await supabase
            .from('User')
            .update({ isverified: true })
            .eq('user_id', userId);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to verify company' });
        }
        res.status(200).json({ message: 'User verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
