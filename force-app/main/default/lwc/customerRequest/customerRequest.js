import { LightningElement, track, api } from "lwc";
import createRecord from "@salesforce/apex/WebToAnythingController.createRecord";
import searchPortfolios from "@salesforce/apex/PortfolioSearchController.searchPortfolios";

export default class CustomerRequest extends LightningElement {
  @track lastName = "";
  @track email = "";
  @track phone = "";
  @track leadSource = "";
  @track otherSource = "";
  @track constructionType = "";
  @track constructionStart = "";
  @track spaceType = "";
  @track spaceCondition = "";
  @track spaceSize = "";
  @track dateTime = "";

  @track style = [];

  @track showSearch = false;
  @track portfolios = [];
  @track selectedPortfolio = null;

  @track city = "";
  @track district = "";

  @api apiName = "Lead";

  get leadSourceOptions() {
    //new org
    return [
      { label: "지인 추천", value: "지인 추천" },
      { label: "SNS", value: "SNS" },
      // { label: "검색 엔진", value: "Search Engine" },
      { label: "인터넷 검색", value: "인터넷 검색" }
      // { label: "박람회", value: "Trade Show" },
      // { label: "기타", value: "Other" }
    ];
  }

  get cityOptions() {
    return [
      { label: "서울특별시", value: "서울특별시" },
      { label: "부산광역시", value: "부산광역시" },
      { label: "대구광역시", value: "대구광역시" },
      { label: "인천광역시", value: "인천광역시" },
      { label: "광주광역시", value: "광주광역시" },
      { label: "대전광역시", value: "대전광역시" },
      { label: "울산광역시", value: "울산광역시" },
      { label: "세종특별자치시", value: "세종특별자치시" },
      { label: "경기도", value: "경기도" },
      { label: "강원도", value: "강원도" },
      { label: "충청북도", value: "충청북도" },
      { label: "충청남도", value: "충청남도" },
      { label: "전라북도", value: "전라북도" },
      { label: "전라남도", value: "전라남도" },
      { label: "경상북도", value: "경상북도" },
      { label: "경상남도", value: "경상남도" },
      { label: "제주특별자치도", value: "제주특별자치도" }
    ];
  }

  get districtOptions() {
    return [
      { label: "강남구", value: "강남구" },
      { label: "강동구", value: "강동구" },
      { label: "강북구", value: "강북구" },
      { label: "강서구", value: "강서구" },
      { label: "관악구", value: "관악구" },
      { label: "광진구", value: "광진구" },
      { label: "구로구", value: "구로구" },
      { label: "금천구", value: "금천구" },
      { label: "노원구", value: "노원구" },
      { label: "도봉구", value: "도봉구" },
      { label: "동대문구", value: "동대문구" },
      { label: "동작구", value: "동작구" },
      { label: "마포구", value: "마포구" },
      { label: "서대문구", value: "서대문구" },
      { label: "서초구", value: "서초구" },
      { label: "성동구", value: "성동구" },
      { label: "성북구", value: "성북구" },
      { label: "송파구", value: "송파구" },
      { label: "양천구", value: "양천구" },
      { label: "영등포구", value: "영등포구" },
      { label: "용산구", value: "용산구" },
      { label: "은평구", value: "은평구" },
      { label: "종로구", value: "종로구" },
      { label: "중구", value: "중구" },
      { label: "중랑구", value: "중랑구" }
    ];
  }

  //스타일 옵션
  get styleOptions() {
    return [
      { label: "모던", value: "모던" },
      { label: "내추럴", value: "내추럴" },
      { label: "클래식&앤틱", value: "클래식&앤틱" },
      { label: "한국&아시아", value: "한국&아시아" },
      { label: "인더스트리얼", value: "인더스트리얼" },
      { label: "미니멀&심플", value: "미니멀&심플" },
      { label: "북유럽", value: "북유럽" },
      { label: "러블리&로맨틱", value: "러블리&로맨틱" },
      { label: "빈티지&레트로", value: "빈티지&레트로" }
      //   { label: "기타", value: "스타일 직접 입력" }
    ];
  }

  // 시공 유형 옵션
  get constructionOptions() {
    return [
      { label: "집 전체 시공", value: "집 전체 시공" },
      { label: "부분 시공", value: "부분 시공" }
    ];
  }

  // 시공 시작 옵션
  get startDateOptions() {
    return [
      { label: "2주-1달 이내", value: "2주-1달 이내" },
      { label: "1달-2달 이내", value: "1달-2달 이내" },
      { label: "2달-3달 이내", value: "2달-3달 이내" },
      { label: "3달-4달 이내", value: "3달-4달 이내" }
    ];
  }

  // 공간 유형 옵션
  get spaceTypeOptions() {
    return [
      { label: "아파트", value: "아파트" },
      { label: "오피스텔", value: "오피스텔" },
      { label: "빌라", value: "빌라" },
      { label: "단독주택", value: "단독주택" },
      { label: "사무실", value: "사무실" } //new
    ];
  }

  // 공간 상황 옵션
  get spaceConditionOptions() {
    return [
      { label: "현재 공실", value: "현재 공실" },
      { label: "시공 시 공실 예정", value: "시공 시 공실 예정" },
      {
        label: "사용/거주중(보관이사 예정)",
        value: "사용/거주중(보관이사 예정)"
      }
    ];
  }

  // 시공공간 크기 옵션
  get spaceSizeOptions() {
    return [
      { label: "10평 이하", value: "10평 이하" },
      { label: "11~20평", value: "11~20평" },
      { label: "21~30평", value: "21~30평" },
      { label: "31~40평", value: "31~40평" },
      { label: "41~50평", value: "41~50평" },
      { label: "51~70평", value: "51~70평" },
      { label: "71~100평", value: "71~100평" },
      { label: "101~150평", value: "101~150평" },
      { label: "151~200평", value: "151~200평" },
      { label: "200평 이상", value: "200평 이상" }
    ];
  }

  handleInputChange(event) {
    const { name, value } = event.target;

    if (name === "style") {
      // this.style = value.join(",");
      // this.styl = value.split(",");
      this.style = value;
    } else {
      this[name] = value;
    }
    if (name === "leadSource") {
      this.showOtherSource = value === "Other";
    }
  }

  handleSearch() {
    this.showSearch = true;
    console.log(
      "Searching Portfolios with city:",
      this.city,
      "district:",
      this.district,
      "this style:",
      this.style
    );

    searchPortfolios({
      city: this.city,
      district: this.district,
      styling: this.style
    })
      .then((result) => {
        this.portfolios = result.map((portfolio) => ({
          ...portfolio,
          stylingArray: portfolio.Styling__c
            ? portfolio.Styling__c.split(";")
            : []
        }));
        this.selectedPortfolio = null;
      })
      .catch((error) => {
        console.error("Error fetching portfolios:", error);
      });
  }
  handlePost() {
    //견적 요청 공개하기
    let fdateTime = new Date(this.dateTime);
    let options = {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };

    let seoulTime = fdateTime.toLocaleString("en-CA", options);
    console.log(seoulTime);
    let formattedDateTime = seoulTime.replace(",", "").replace(/\//g, "-");

    const FormData = {
      // 신규 org
      Field7__c: this.constructionType,
      Field6__c: this.constructionStart,
      Field5__c: this.spaceType,
      Field3__c: this.spaceCondition,
      Field4__c: this.spaceSize,
      Field8__c: this.dateTime ? formattedDateTime : null,
      FirstName: "",
      LastName: this.lastName,
      Email: this.email,
      Phone: this.phone,
      City__c: this.city,
      District__c: this.district,
      Field12__c: this.leadSource,
      Styling__c: this.style.join(";"),

      LeadSource: "Other",
      // Other_Source__c: this.otherSource,
      Status: "Open - Not Contacted",
      RecordTypeId: "012dL0000052MspQAE"
    };
    const result = createRecord({ objectApiName: this.apiName, data: FormData })
      .then((data) => {
        console.log("Response:", data);
        this.result = data;
        alert("정상적으로 신청되었습니다.");
      })
      .catch((error) => {
        console.error("Error:", error);
        this.error = error;
      });
    console.log(result);
  }

  handleSubmit(event) {
    let fdateTime = new Date(this.dateTime);

    let options = {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };

    let seoulTime = fdateTime.toLocaleString("en-CA", options);
    console.log(seoulTime);

    let formattedDateTime = seoulTime.replace(",", "").replace(/\//g, "-");
    const portfolioId = event.target.closest("lightning-card").dataset.id;
    this.selectedPortfolio = this.portfolios.find((p) => p.Id === portfolioId);
    console.log(this.selectedPortfolio.Account__c);
    const FormData = {
      Field7__c: this.constructionType,
      Field6__c: this.constructionStart,
      Field5__c: this.spaceType,
      Field3__c: this.spaceCondition,
      Field4__c: this.spaceSize,
      Field8__c: this.dateTime ? formattedDateTime : null,
      FirstName: "",
      LastName: this.lastName,
      Email: this.email,
      Phone: this.phone,
      City__c: this.city,
      District__c: this.district,
      Field12__c: this.leadSource,
      LeadSource: "Web",
      Styling__c: this.style.join(";"),
      // Other_Source__c: this.otherSource,
      Status: "Open - Not Contacted",
      RecordTypeId: "012dL0000052MspQAE",
      AccountId: this.selectedPortfolio.Account__c
    };
    console.log("Submitting FormData:", JSON.stringify(FormData, null, 2));
    const result = createRecord({ objectApiName: this.apiName, data: FormData })
      .then((data) => {
        console.log("Response:", data);
        this.result = data;
        alert("정상적으로 신청되었습니다.");
      })
      .catch((error) => {
        console.error("Error:", error);
        this.error = error;
        alert("제대로 요청이 제출되지 않았습니다.");
      });
  }
}