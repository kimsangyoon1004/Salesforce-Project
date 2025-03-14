import { LightningElement, track } from 'lwc';
import verifyBusinessNumber from '@salesforce/apex/BusinessVerificationService.verifyBusinessNumber';

export default class PartnerReg extends LightningElement {
  
    @track businessLicenseNumber = '';
    // @track verificationResult = '';
    @track verificationResult = true;
     
    @track verificationError = ''; 
    @track leadSource = '';
    @track otherSource = '';
    @track showOtherSource = false;

    get sourceOptions() {
        return [
            { label: '지인 추천', value: 'Partner Referral' },
            { label: 'SNS 광고', value: 'SNS' },
            { label: '기타', value: 'Other' }
        ];
    }

    handleChange(event) {
        const field = event.target.dataset.field; 
        const value = event.target.value;
        if (field) {
            this[field] = value; 
           
        }

        if(field === "leadSource"){
            this.showOtherSource = (value == 'Other');
            console.log(this.leadSource);
        }
    
    }


    async handleVerification() {
        this.verificationResult = '';
        this.verificationError = '';

        if (!/^\d{10}$/.test(this.businessLicenseNumber)) {
            this.verificationError = "사업자 등록번호는 10자리 숫자여야 합니다.";
            return;
        }

        try {
            console.log('Calling Apex method with:', this.businessLicenseNumber);
            const result = await verifyBusinessNumber({ businessNumber: this.businessLicenseNumber });
            console.log('Apex method returned:', result);

            if (result === 'Approved') {
                this.verificationResult = "✅ 사업자 인증 성공!";
            } else if (result === 'Rejected') {
                this.verificationError = "❌ 폐업되었거나 유효하지 않은 사업자 번호입니다.";
            } else if (result.startsWith('Error:')) {
                this.verificationError = "❌ " + result;
            } else {
                this.verificationError = "❌ 인증 중 알 수 없는 문제가 발생했습니다.";
            }
        } catch (error) {
            this.verificationError = "API 호출 중 오류 발생: " + (error.body ? error.body.message : error.message);
            console.error('Error calling Apex method:', error);
        }
    }
}