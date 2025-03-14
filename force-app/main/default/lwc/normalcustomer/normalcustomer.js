import { LightningElement, track } from 'lwc';

export default class NormalCustomer extends LightningElement {
    @track firstName = ''; // 이름 필드만 유지
    @track email = '';
    @track phone = '';
    @track leadStatus = '';
    @track leadSource = '';
    @track otherSource = '';
    @track showOtherSource = false;

    @track constructionType = '';
    @track constructionStart = '';
    @track spaceType = '';
    @track spaceCondition = '';
    @track spaceSize = '';
    @track callDate = '';
    @track callTime = '';
    @track emailValid = true;

    // 리드 상태 옵션
    get leadStatusOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '견적 요청', value: '견적 요청' },
            { label: '진행 중', value: '진행 중' },
            { label: '완료', value: '완료' }
        ];
    }

    // 리드 출처 옵션
    get leadSourceOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '광고', value: '광고' },
            { label: '추천', value: '추천' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // 시공 유형 옵션
    get constructionOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '인테리어', value: '인테리어' },
            { label: '리모델링', value: '리모델링' }
        ];
    }

    // 시공 시작 옵션
    get startDateOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '즉시', value: '즉시' },
            { label: '1개월 이내', value: '1개월 이내' },
            { label: '3개월 이내', value: '3개월 이내' }
        ];
    }

    // 공간 유형 옵션
    get spaceTypeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '주거', value: '주거' },
            { label: '상업', value: '상업' }
        ];
    }

    // 공간 상황 옵션
    get spaceConditionOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '신축', value: '신축' },
            { label: '부분 공사', value: '부분 공사' }
        ];
    }

    // 시공공간 크기 옵션
    get spaceSizeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '10평 이하 (~33㎡)', value: '10평 이하' },
            { label: '11~15평 (34~49㎡)', value: '11~15평' },
            { label: '16~20평 (50~66㎡)', value: '16~20평' },
            { label: '21~25평 (67~82㎡)', value: '21~25평' },
            { label: '26~30평 (83~99㎡)', value: '26~30평' },
            { label: '31~35평 (100~115㎡)', value: '31~35평' },
            { label: '36~40평 (116~132㎡)', value: '36~40평' },
            { label: '41~45평 (133~148㎡)', value: '41~45평' },
            { label: '46~50평 (149~165㎡)', value: '46~50평' },
            { label: '51평 이상 (166㎡~)', value: '51평 이상' }
        ];
    }

    // 입력 필드 값 변경 처리
    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
        if(field === "leadSource"){
            this.showOtherSource = (value == 'Other');
            console.log(this.leadSource);
        }
    }

    // 이메일 유효성 검사
    validateEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email);
    }

    // // 폼 제출 처리
    // handleSubmit() {
    //     this.emailValid = this.validateEmail(this.email);

    //     if (!this.firstName || !this.emailValid) {
    //         console.log('폼이 유효하지 않습니다.');
    //         return;
    //     }

    //     // 제출된 데이터 로깅
    //     console.log('제출된 데이터:', {
    //         firstName: this.firstName,
    //         email: this.email,
    //         phone: this.phone,
    //         leadStatus: this.leadStatus,
    //         leadSource: this.leadSource,
    //         otherSource: this.otherSource,
    //         constructionType: this.constructionType,
    //         constructionStart: this.constructionStart,
    //         spaceType: this.spaceType,
    //         spaceCondition: this.spaceCondition,
    //         spaceSize: this.spaceSize,
    //         callDate: this.callDate,
    //         callTime: this.callTime
    //     });

    //     // 실제로 Salesforce에 저장하려면 Apex 메서드 호출 필요
    // }
}