import { LightningElement, api, track } from 'lwc';
import getSignedUrl from '@salesforce/apex/GCSUploadService.getSignedUrl';
import updateLeadWithImageUrl from '@salesforce/apex/GCSUploadService.updateLeadWithImageUrl';

export default class LeadImageUpload extends LightningElement {
    @api recordId; // URL에서 받은 Lead ID
    @track isLoading = false;
    @track errorMessage = '';
    @track fileData;

    //  파일 선택 시 처리
    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB 제한
                this.errorMessage = " 파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택하세요.";
                return;
            }

            this.fileData = {
                fileName: file.name,
                fileType: file.type,
                fileContent: file // Blob 데이터
            };
            this.errorMessage = '';
            console.log(" [파일 선택 완료]", this.fileData);
        }
    }

    //  GCS에 파일 업로드
    async uploadFileToGCS() {
        if (!this.fileData) {
            this.errorMessage = " 파일을 선택하세요.";
            return;
        }

        try {
            this.isLoading = true;

            //  GCS Signed URL 요청
            const signedUrl = await getSignedUrl({
                fileName: this.fileData.fileName,
                contentType: this.fileData.fileType
            });

            console.log("🔗 [GCS Signed URL]:", signedUrl);

            //  실제 파일 업로드 (PUT 요청)
            const response = await fetch(signedUrl, {
                method: "PUT",
                headers: { "Content-Type": this.fileData.fileType },
                body: this.fileData.fileContent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            //  업로드된 이미지 URL 저장
            const imageUrl = signedUrl.split("?")[0];

            //  Apex 호출하여 Lead 업데이트
            await updateLeadWithImageUrl({ leadId: this.recordId, imageUrl });

            console.log(" [GCS 업로드 완료] URL:", imageUrl);
            this.errorMessage = " 업로드 완료!";

        } catch (error) {
            this.errorMessage = " 업로드 실패: " + error.message;
            console.error(" [GCS 업로드 실패]", error);
        } finally {
            this.isLoading = false;
        }
    }
}