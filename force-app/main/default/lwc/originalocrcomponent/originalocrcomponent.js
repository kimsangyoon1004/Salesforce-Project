import { LightningElement, api, track } from 'lwc';
import extractBusinessInfo from '@salesforce/apex/originalGoogleCloudVision.extractBusinessInfo'; // Apex 메서드 임포트

export default class originalOcrComponent extends LightningElement {
    @track businessInfo = {}; // 추출된 정보를 저장할 변수
    @track error; // 오류 메시지를 저장할 변수
    @track isLoading = false; // 로딩 상태를 표시할 변수

    handleImageUpload(event) {
        this.isLoading = true; // 로딩 시작
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const base64Image = reader.result.split(',')[1]; // Base64 데이터 추출

            extractBusinessInfo({ base64Image }) // Apex 메서드 호출
                .then(result => {
                    this.businessInfo = result; // 추출된 정보 저장
                    this.error = null; // 오류 메시지 초기화
                })
                .catch(error => {
                    this.error = error; // 오류 메시지 저장
                    this.businessInfo = {}; // 추출된 정보 초기화
                })
                .finally(() => {
                    this.isLoading = false; // 로딩 종료
                });
        };

        reader.readAsDataURL(file); // 이미지 파일 읽기
    }
}