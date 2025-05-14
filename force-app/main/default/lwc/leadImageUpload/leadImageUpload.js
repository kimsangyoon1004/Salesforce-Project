import { LightningElement, api, track } from 'lwc';
import getSignedUrl from '@salesforce/apex/GCSUploadService.getSignedUrl';
import updateLeadWithImageUrl from '@salesforce/apex/LeadUpdateService.updateLeadWithImageUrl';

export default class LeadImageUpload extends LightningElement {
    @api recordId;
    @track fileData;
    @track imageUrl = "";
    @track isLoading = false;
    @track uploadSuccess = false;
    @track uploadError = "";
    @track certificateAccepted = false;

    //  recordId가 없는 경우 URL에서 leadId 가져오기
    connectedCallback() {
        if (!this.recordId) {
            const params = new URLSearchParams(window.location.search);
            this.recordId = params.get("leadId");

            console.log(" URL에서 가져온 리드 ID:", this.recordId);
        }
    }

    get isSubmitDisabled() {
        return !this.fileData || !this.certificateAccepted || this.isLoading;
    }

    get fileSize() {
        return this.fileData ? (this.fileData.fileContent.size / 1024).toFixed(2) + " KB" : "";
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.uploadError = " 파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택하세요.";
                return;
            }

            this.fileData = {
                fileName: file.name,
                fileType: file.type,
                fileContent: file
            };

            if (file.type.includes("image")) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.imageUrl = reader.result;
                };
                reader.readAsDataURL(file);
            }

            this.uploadError = "";
        }
    }

    handleCheckboxChange(event) {
        this.certificateAccepted = event.target.checked;
    }

    async uploadFileToGCS() {
        if (!this.fileData) {
            this.uploadError = " 파일을 선택하세요.";
            return;
        }

        try {
            this.isLoading = true;

            console.log(" [GCS 업로드 시작] 파일명:", this.fileData.fileName);

            const signedUrl = await getSignedUrl({
                fileName: this.fileData.fileName,
                contentType: this.fileData.fileType
            });

            console.log(" [GCS Signed URL]:", signedUrl);

            const response = await fetch(signedUrl, {
                method: "PUT",
                headers: { "Content-Type": this.fileData.fileType },
                body: this.fileData.fileContent
            });

            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
            }

            this.imageUrl = signedUrl.split("?")[0]; //  png까지 URL로 저장
            console.log(" [파일 업로드 완료] URL:", this.imageUrl);
        } catch (error) {
            console.error(" [GCS 업로드 실패]", error);
            this.uploadError = " GCS 업로드 실패: " + error.message;
        } finally {
            this.isLoading = false;
        }
    }

    async handleSubmit() {
        console.log("  this.recordId 값 확인:", this.recordId);
        console.log("  this.imageUrl 값 확인:", this.imageUrl);

        if (!this.recordId) {
            this.uploadError = " 리드 ID가 없습니다!";
            return;
        }

        await this.uploadFileToGCS();

        if (!this.imageUrl) {
            this.uploadError = " 업로드된 이미지 URL이 없습니다!";
            return;
        }

        try {
            console.log(" [리드 업데이트 시작]");
            await updateLeadWithImageUrl({ leadId: this.recordId, imageUrl: this.imageUrl });
            console.log(" [리드 업데이트 완료]");
            this.uploadSuccess = true;
            this.uploadError = "";
            window.location.href = "https://crm101-a5-dev-ed.develop.my.site.com/s/thankyou";
        } catch (error) {
            console.error(" [리드 업데이트 실패]:", error);
            this.uploadError = ` 리드 업데이트 실패: ${error.body ? error.body.message : error.message}`;
        }
    }
}