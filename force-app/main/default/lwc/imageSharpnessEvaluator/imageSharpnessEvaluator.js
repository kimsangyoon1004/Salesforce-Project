import { LightningElement, api, track, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import evaluateImageSharpness from "@salesforce/apex/ImageSharpnessEvaluator.evaluateImageSharpness";

import BUSINESS_CERT_IMAGE from "@salesforce/schema/Lead.Business_Certification_Image__c";
import IMAGE_SHARPNESS_FIELD from "@salesforce/schema/Lead.Image_Sharpness__c";
import { getRecord, updateRecord, notifyRecordUpdateAvailable } from "lightning/uiRecordApi";

const FIELDS = [BUSINESS_CERT_IMAGE, IMAGE_SHARPNESS_FIELD];

export default class ImageSharpnessEvaluator extends LightningElement {
    @api recordId;
    @track sharpnessResult = "";  // UI에 표시할 값
    @track analysisClass = "";
    @track error;
    @track isLoading = false;
    @track imageUrl = "";
    
    wiredLeadData;

    // 📌 리드의 이미지 URL 및 선명도 결과 가져오기
    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    wiredLead(result) {
        this.wiredLeadData = result;

        if (result.data) {
            if (result.data.fields?.Business_Certification_Image__c?.value) {
                this.imageUrl = result.data.fields.Business_Certification_Image__c.value;
            }

            if (result.data.fields?.Image_Sharpness__c?.value) {
                this.sharpnessResult = `분석 완료: ${result.data.fields.Image_Sharpness__c.value}`;  // UI에는 "분석 완료: 선명함" 표시
            }
        } else if (result.error) {
            this.error = "데이터를 불러오는 중 오류 발생";
        }
    }

    // 📌 Cloud Run API 호출하여 이미지 선명도 분석
    analyzeImageSharpness() {
        if (!this.imageUrl) {
            this.error = "이미지 URL이 없습니다.";
            return;
        }

        this.isLoading = true;
        this.sharpnessResult = "";
        this.analysisClass = "";

        evaluateImageSharpness({ recordId: this.recordId, imageUrl: this.imageUrl })
            .then(result => {
                let leadValue = result.includes("선명함") ? "선명함" : "선명하지 않음";  // Lead에는 짧게 저장
                this.sharpnessResult = `분석 완료: ${leadValue}`;  // UI에는 전체 문장 표시
                this.updateLeadRecord(leadValue); // Lead 필드 업데이트
            })
            .catch(error => {
                this.error = "이미지 분석 중 오류 발생";
                this.sharpnessResult = "❌ 분석 실패";
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // 📌 Salesforce Lead에 짧은 버전의 선명도 결과 저장
    updateLeadRecord(leadValue) {
        if (!this.recordId) return;

        const fields = {};
        fields[IMAGE_SHARPNESS_FIELD.fieldApiName] = leadValue;  // Lead 필드에는 "선명함"만 저장
        fields["Id"] = this.recordId;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
                return refreshApex(this.wiredLeadData);
            })
            .catch(error => {
                this.error = "선명도 결과 저장 중 오류 발생";
            });
    }
}