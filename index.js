const express = require('express');
const CONFIG = require('./config');
const cors = require('cors');
const companyservice = require('./service/getRecommendedCompanies');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

app.get('/', (req, res) => {
  res.send('APP is live!!')
})

app.get('/company/:id/recommended', async (req,res) => {
    if (!req.params.id) {
        res.status(400).send("Invalid Request - company name or cs_company_id is required");
    }
    else {
        try {
            let result = await companyservice.getRecommendedCompanies(req.params.id);
            res.status(200).send(result);
        }
        catch(error) {
            res.status(400).send(error);
        }
    }
})

app.get('/company/:id', async (req,res) => {
    if (!req.params.id) {
        res.status(400).send("Invalid Request - company name or cs_company_id is required");
    }
    else {
        try {
            let result = await companyservice.getCompanyInfo(req.params.id);
            res.status(200).send(result);
        }
        catch(error) {
            res.status(400).send(error);
        }
    }
})

app.listen(process.env.PORT || CONFIG.APP_PORT, () => {
  console.log(`Example app listening on port ${CONFIG.APP_PORT}`)
})
