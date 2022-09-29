class CompanyResponse {
    constructor(name, safeNumber, creditScore, countryCode, city, turnover, trendData, wishlisted) {
        this.name = name;
        this.safeNumber = safeNumber;
        this.creditScore = creditScore;
        this.countryCode = countryCode;
        this.city = city;
        this.turnover = turnover;
        this.trendData = trendData;
        this.wishlisted = wishlisted;
    }
}

class RecommendedCompaniesResponse {
    constructor(currentCompany, recommendedCompanies) {
        this.currentCompany = currentCompany;
        this.recommendedCompanies = recommendedCompanies;
    }
}

module.exports = {
    CompanyResponse : CompanyResponse,
    RecommendedCompaniesResponse : RecommendedCompaniesResponse
}