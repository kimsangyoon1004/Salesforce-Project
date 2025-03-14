import { LightningElement, api, track, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import extractFilteredText from "@salesforce/apex/GoogleCloudVision.extractFilteredText";

import BUSINESS_CERT_IMAGE from "@salesforce/schema/Lead.Business_Certification_Image__c";
import EXTRACTED_TEXT_FIELD from "@salesforce/schema/Lead.Extracted_text__c";
import { getRecord, updateRecord, notifyRecordUpdateAvailable } from "lightning/uiRecordApi";

const FIELDS = [BUSINESS_CERT_IMAGE, EXTRACTED_TEXT_FIELD];

export default class OcrComponent extends LightningElement {
    @api recordId;
    @track businessInfo = {}; // OCR 데이터 저장
    @track error;
    @track isLoading = false;
    @track imageUrl = "";

    wiredLeadData;

    // ✅ OCR 데이터를 Lead에서 불러오기
    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    wiredLead(result) {
        this.wiredLeadData = result;

        if (result.data) {
            if (result.data.fields?.Business_Certification_Image__c?.value) {
                this.imageUrl = result.data.fields.Business_Certification_Image__c.value;
            }

            // ✅ 저장된 OCR 결과 불러오기
            if (result.data.fields?.Extracted_Text__c?.value) {
                try {
                    this.businessInfo = JSON.parse(result.data.fields.Extracted_Text__c.value);
                } catch (error) {
                    this.businessInfo = {};
                }
            }
        } else if (result.error) {
            this.error = "데이터를 불러오는 중 오류 발생";
        }
    }

    // ✅ OCR 실행 버튼 클릭 시 처리
    extractTextFromImage() {
        if (!this.imageUrl) {
            this.error = "OCR 실행을 위한 이미지 URL이 없습니다.";
            return;
        }

        this.isLoading = true;
        extractFilteredText({ imageUrl: this.imageUrl })
            .then(result => {
                try {
                    this.businessInfo = typeof result === "string" ? JSON.parse(result) : result;

                    // 기본 값 설정
                    this.businessInfo = {
                        "등록번호": this.businessInfo.등록번호 || "정보 없음",
                        "법인명": this.businessInfo.법인명 || "정보 없음",
                        "대표자": this.businessInfo.대표자 || "정보 없음",
                        "개업연월일": this.businessInfo.개업연월일 || "정보 없음"
                    };

                    this.updateLeadRecord(); // ✅ OCR 결과를 Lead에 저장
                } catch (error) {
                    this.businessInfo = {};
                }
            })
            .catch(error => {
                this.error = "OCR 처리 중 오류 발생";
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // ✅ OCR 결과를 Lead에 저장하는 함수
    updateLeadRecord() {
        if (!this.recordId) return;

        const fields = {};
        fields[EXTRACTED_TEXT_FIELD.fieldApiName] = JSON.stringify(this.businessInfo);
        fields["Id"] = this.recordId;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
                return refreshApex(this.wiredLeadData);
            })
            .catch(error => {
                this.error = "OCR 결과 저장 중 오류 발생";
            });
    }
}