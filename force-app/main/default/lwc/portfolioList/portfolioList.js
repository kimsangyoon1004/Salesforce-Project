import { LightningElement, track } from "lwc";
import searchPortfolios from "@salesforce/apex/PortfolioSearchController.searchPortfolios";

export default class PortfolioList extends LightningElement {
  @track city = "서울특별시";
  @track district = "강남구";
  @track styling = [];
  @track portfolios = [];
  @track selectedPortfolio = null;

  handleFilterChange(event) {
    const { name, value } = event.target;
    if (name === "styling") {
      this.styling = value.join(","); // Convert multi-picklist to array
    } else {
      this[name] = value;
    }
  }

  handleSearch() {
    searchPortfolios({
      city: this.city,
      district: this.district,
      styling: this.styling
    })
      .then((result) => {
        this.portfolios = result;
        this.selectedPortfolio = null;

        this.portfolios = result.map((portfolio) => ({
          ...portfolio,
          stylingArray: portfolio.Styling__c
            ? portfolio.Styling__c.split(";")
            : []
        }));
      })
      .catch((error) => {
        console.error("Error fetching portfolios:", error);
      });
  }

  handleSelect(event) {
    const portfolioId = event.currentTarget.dataset.id;
    this.selectedPortfolio = this.portfolios.find((p) => p.Id === portfolioId);
  }
}