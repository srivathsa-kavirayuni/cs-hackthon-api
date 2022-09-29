const axios = require('axios');
const CONFIG = require('../config');
const { CompanyResponse, RecommendedCompaniesResponse } = require('../model/companyResponse');

const API_ROUTE = {
    REPORT : '/report/',
    INDEX : '/uidx/filter'
}

const API_PARAMS = {
    CREDIT_SCORE : 'credit_score',
    COUNTRY_CODE : 'country_code'
}

async function getCompanyInfo(id) {
    let currentCompanyResults = await ExecuteAsAsync(getCompanyReport(id, API_ROUTE.REPORT));
    // console.log(JSON.stringify(result));
    return new CompanyResponse(
        currentCompanyResults.global_index?.global_index_current?.company_name ? currentCompanyResults.global_index.global_index_current.company_name : "",
        currentCompanyResults.global_index?.global_index_current?.cs_company_id ? currentCompanyResults.global_index.global_index_current.cs_company_id : "",
        currentCompanyResults.global_index?.global_index_current?.credit_score ? currentCompanyResults.global_index?.global_index_current?.credit_score : "N/A", 
        currentCompanyResults.global_index?.global_index_current?.country_code ? currentCompanyResults.global_index?.global_index_current?.country_code : "",
        currentCompanyResults.global_index?.global_index_current?.city ? currentCompanyResults.global_index?.global_index_current?.city : "",
        currentCompanyResults.global_index?.global_index_current?.turnover ? currentCompanyResults.global_index?.global_index_current?.turnover: "",
        generateRandomTrend(),
        false
    );
}

const generateRandomTrend = () => {
  let arr = [];
  while (arr.length < 8) {
    let r = Math.floor(Math.random() * 1000000) + 1;
    // if(arr.indexOf(r) === -1)
    arr.push(r);

  }
  return arr;
};

async function getRecommendedCompanies(id) {
    let currentCompanyResults = await ExecuteAsAsync(getCompanyInfo(id));
    let recommendedCompanies = [];
    // filter criteria => country, city & nearest credit score
    const creditScore = currentCompanyResults.creditScore;
    let result = await ExecuteAsAsync(searchCompanies(currentCompanyResults.countryCode, currentCompanyResults.city, creditScore));
    if (result.hits && result.hits.hits && result.hits.hits.length > 0) {
        for(let company in result.hits.hits) {
            let companyDetails = result.hits.hits[company]["_source"];
            recommendedCompanies.push(new CompanyResponse(
                companyDetails.NAME,
                companyDetails.CS_COMPANY_ID,
                companyDetails.CREDIT_SCORE,
                companyDetails.COUNTRY,
                companyDetails.TOWN,
                companyDetails.LATEST_TURNOVER,
                generateRandomTrend(),
                false
            ));
        }
    }
    return new RecommendedCompaniesResponse(currentCompanyResults, recommendedCompanies);
}

async function getCompanyReport(cs_company_id, api_type, api_params) {
    let config = {
        url:  api_params ? CONFIG.API_URL + api_type + cs_company_id + api_params : CONFIG.API_URL + api_type + cs_company_id,
        headers: { 
          'Authorization': 'Bearer ' + CONFIG.AUTH_TOKEN
        }
      };
      let result = await axios.get(config.url, { headers : config.headers} );
      if (result && result.status == 200) {
        return result.data;
      }
      else {
        throw "Error while getting company data";
      }
}

function ExecuteAsAsync(asyncMethod) {
    return new Promise((resolve, reject) => {
        try {
            resolve(asyncMethod);
        }
        catch (error) {
            reject(error);
        }
    });
}

async function searchCompanies(countryCode, city, creditScore) {
    let local_body = JSON.stringify({
        "query": {
          "bool": {
            "should" : [
              {"match": {"COUNTRY": countryCode}},
              {"match": {"TOWN": city}},
              { "term" : { "CREDIT_SCORE.keyword" :  creditScore }},
              { "range": {"CREDIT_SCORE": {"lt": creditScore + 100,"gte": creditScore }}}
            ]
          }
        },
        "size": 10
      });
    let result = await axios.post(CONFIG.ELASTIC_URL + "/_search", local_body);
      if (result && result.status == 200 && result.data.hits && result.data.hits.total > 0) {
        return result.data;
      }
      else {
        throw "Error while getting recommended companies";
      }
}

module.exports =  {
    getCompanyInfo : getCompanyInfo,
    getRecommendedCompanies : getRecommendedCompanies
}
