import { LightningElement, track, api } from "lwc";
import createRecord from "@salesforce/apex/WebToAnythingController.createRecord";
import verifyBusinessNumber from "@salesforce/apex/BusinessVerificationService.verifyBusinessNumber";
import getSignedUrl from "@salesforce/apex/GCSUploadService.getSignedUrl";

export default class PartnerLeadFormtest extends LightningElement {
  @api apiName = "Lead";
  //   @api cityFieldApiName = "City__c";
  //   @api districtFieldApiName = "District__c";
  //   @api industryFieldApiName = "Industry";
  //   @api sourceFieldApiName = "LeadSource";
  //   @track FormData = {
  //     Business_registration_number__c: "",
  //     FirstName: "",
  //     LastName: "",
  //     Phone: "",
  //     Email: "",
  //     Company: "",
  //     Website: "",
  //     City__c: "",
  //     District__c: "",
  //     Industry: "",
  //     Description: "",
  //     LeadSource: "",
  //     Other_Source__c: "",
  //     RecordTypeId: "012dL0000050av5QAA",
  //     Status: "New"
  //   };

  // Store form values separately
  @track businessNumber = "";
  @track firstName = "";
  @track lastName = "";
  @track phone = "";
  @track email = "";
  @track company = "";
  @track website = "";
  @track city = "";
  @track district = "";
  @track industry = "";
  @track description = "";
  @track leadSource = "";
  @track otherSource = "";
  // @track recordTypeId = "012dL0000050av5QAA";
  @track recordTypeId = "012dL0000052NiPQAU"; //신규 org
  @track status = "New";

  @track verificationResult = "";
  @track verificationError = "";
  @track showOtherSource = false;
  @track businessNumber = "";
  @track imageUrl = ""; // 업로드된 이미지 URL 저장

  @track fileData; // 파일 데이터 저장

    // 📌 파일 선택 시 Blob 데이터 처리
    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            // ✅ 5MB 이상 파일 업로드 방지
            if (file.size > 5 * 1024 * 1024) {
                this.uploadError = "❌ 파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택하세요.";
                return;
            }

            this.fileData = {
                fileName: file.name,
                fileType: file.type,
                fileContent: file // ✅ Blob 데이터 저장 (Base64 X)
            };
            console.log("📂 [파일 데이터 설정 완료]", this.fileData);
        } else {
            console.error("❌ [파일 선택 오류] 파일이 없습니다.");
        }
    }

async uploadFileToGCS() {
    if (!this.fileData) {
        console.error("❌ [파일 업로드 오류] 파일이 없습니다.");
        return;
    }

    try {
        console.log("📤 [GCS 업로드 시작] 파일명:", this.fileData.fileName);

        // ✅ Signed URL 요청 (Apex 호출)
        const signedUrl = await getSignedUrl({
            fileName: this.fileData.fileName,
            contentType: this.fileData.fileType
        });

        console.log("🔗 [GCS Signed URL]:", signedUrl);

        // ✅ Blob 데이터 직접 업로드
        const response = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": this.fileData.fileType },
            body: this.fileData.fileContent // ✅ Base64 변환 없이 Blob 업로드
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.imageUrl = signedUrl.split("?")[0]; // ✅ 실제 GCS URL 저장
        console.log("✅ [GCS 업로드 완료] URL:", this.imageUrl);
    } catch (error) {
        console.error("❌ [GCS 업로드 실패]", error);
        this.uploadError = "❌ GCS 업로드 실패: " + error.message;
    }
}



  //   handleChange(event) {
  //     this.FormData[event.target.name] = event.target.value;
  //     if (event.target.name === "LeadSource") {
  //       this.showOtherSource = event.target.value == "Other";
  //       //    console.log(this.leadSource);
  //     }
  //   }

  handleChange(event) {
    const { name, value } = event.target;
    this[name] = value;

    if (name === "leadSource") {
      this.showOtherSource = value === "Other";
    }
  }

  get leadSourceOptions() {
    return [
      { label: "지인 추천", value: "External Referral" },
      { label: "SNS", value: "SNS" },
      { label: "검색 엔진", value: "Search Engine" },
      { label: "인터넷 광고", value: "Web" },
      { label: "박람회", value: "Trade Show" },
      { label: "기타", value: "Other" }
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
  get industryOptions() {
    return [
      { label: "가구 및 제품", value: "Furniture & Products" },
      { label: "이사 및 청소", value: "Moving & Cleaning" },
      { label: "인테리어", value: "Interior Design" },
      { label: "기타", value: "Other" }
    ];
  }

  async handleVerification() {
    this.verificationResult = "";
    this.verificationError = "";

    if (!/^\d{10}$/.test(this.businessNumber)) {
      this.verificationError = "사업자 등록번호는 10자리 숫자여야 합니다.";
      return;
    }

    try {
      console.log("Calling Apex method with:", this.businessNumber);
      const result = await verifyBusinessNumber({
        businessNumber: this.businessNumber
      });
      console.log("Apex method returned:", result);

      if (result === "Approved") {
        this.verificationResult = "✅ 사업자 인증 성공!";
        console.log(this.verificationResult);
      } else if (result === "Rejected") {
        this.verificationError =
          "❌ 폐업되었거나 유효하지 않은 사업자 번호입니다.";
      } else if (result.startsWith("Error:")) {
        this.verificationError = "❌ " + result;
      } else {
        this.verificationError = "❌ 인증 중 알 수 없는 문제가 발생했습니다.";
      }
    } catch (error) {
      this.verificationError =
        "API 호출 중 오류 발생: " +
        (error.body ? error.body.message : error.message);
      console.error("Error calling Apex method:", error);
    }
  }

  async handleSubmit() {
    try {
        // 📌 파일 업로드 먼저 실행
        if (this.fileData && !this.imageUrl) {
            console.log("📤 [파일 업로드 시작]");
            await this.uploadFileToGCS();
            console.log("✅ [파일 업로드 완료] URL:", this.imageUrl);
        }

        // 📌 업로드 실패 체크
        if (!this.imageUrl) {
            console.error("❌ [오류] 이미지 URL이 없습니다.");
            return;
        }

        const FormData = {
            Field9__c: this.businessNumber,
            FirstName: this.firstName,
            LastName: this.lastName,
            Phone: this.phone,
            Email: this.email,
            Company: this.company,
            Website: this.website,
            City: this.city,
            District__c: this.district,
            Industry: this.industry,
            Field11__c: this.description,
            LeadSource: this.leadSource,
            Description: this.otherSource,
            RecordTypeId: this.recordTypeId,
            Status: "Open - Not Contacted",
            Business_Certification_Image__c: this.imageUrl // ✅ GCS에서 업로드된 URL
        };

        console.log("📩 [제출할 데이터]", JSON.stringify(FormData, null, 2));

        const response = await createRecord({ objectApiName: this.apiName, data: FormData });
        console.log("✅ [리드 생성 완료]", response);

        window.location.href = "https://crm101-a5-dev-ed.develop.my.site.com/s/thankyou";
    } catch (error) {
        console.error("❌ [제출 오류]", error);
    }
}

// 📌 Base64 -> ArrayBuffer 변환
base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
}