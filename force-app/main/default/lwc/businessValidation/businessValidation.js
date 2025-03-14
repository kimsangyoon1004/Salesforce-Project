import { LightningElement, api, wire } from 'lwc';
import validateBusiness from '@salesforce/apex/BusinessValidationController.validateBusiness';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import VERIFICATION_STATUS from '@salesforce/schema/Lead.Verification_Status__c';

export default class BusinessValidation extends LightningElement {
    @api recordId;
    verificationStatus;

    @wire(getRecord, { recordId: '$recordId', fields: [VERIFICATION_STATUS] })
    wiredRecord({ error, data }) {
        if (data) {
            this.verificationStatus = getFieldValue(data, VERIFICATION_STATUS);
        } else if (error) {
            this.verificationStatus = '불러오기 실패';
        }
    }

    handleValidate() {
        validateBusiness({ recordId: this.recordId })
            .then((result) => {
                console.log('✅ Apex 반환 값:', result);  // DEBUG 확인
                this.verificationStatus = result;

                // ✅ 초록색 토스트 메시지를 보장하는 로직 추가
                let toastVariant = '';  // 기본값 (빨간색)
                let toastTitle = '사업자 인증 결과';

                if (result.includes('일치 - 존재함')) {
                    toastVariant = 'success';  // ✅ 초록색 (성공)
                    toastTitle = '✅ 사업자 인증 성공';
                } else if (result.includes('존재하지 않음')) {
                    toastVariant = 'warning';  // ⚠️ 노란색 (경고)
                    toastTitle = '⚠️ 사업자 없음';
                }

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: toastTitle,
                        message: result,
                        variant: toastVariant
                    })
                );
            })
            .catch((error) => {
                console.error('❌ Apex 호출 오류:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: '❌ 사업자 인증 오류',
                        message: 'API 호출 중 오류 발생',
                        variant: 'error'
                    })
                );
            });
    }
}